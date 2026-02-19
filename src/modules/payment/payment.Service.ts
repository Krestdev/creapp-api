import { Payment, PrismaClient, Signatair, User } from "@prisma/client";
import { getIO } from "../../socket";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";

const prisma = new PrismaClient();

export class PaymentService {
  CACHE_KEY = "payment";
  // Create
  create = async (
    data: Omit<Payment, "id" | "reference" | "status">,
    file: Express.Multer.File[] | null,
  ) => {
    if (!data.invoiceId) {
      throw new Error("Invoice ID is required for payment");
    }

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: data.invoiceId },
    });

    const invoicePayments = await prisma.payment.findMany({
      where: { invoiceId: data.invoiceId },
    });

    const totalPaid = invoicePayments
      .filter((elm) => elm.status !== "rejected" && elm.status !== "cancelled")
      .reduce((sum, payment) => sum + payment.price, 0);

    const remainingAmount = invoice.amount - totalPaid;

    if (data.price > remainingAmount) {
      throw new Error("Payment amount exceeds the remaining invoice amount");
    }

    if (remainingAmount === 0) {
      prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          status: "PAID",
        },
      });
      throw new Error("The invoice has already been fully paid");
    }

    if (data.price !== invoice.amount) {
      data.isPartial = true;
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        invoiceId: Number(data.invoiceId),
        reference: `PAY-${Date.now()}`, // simple reference generation
        status: "pending",
      },
    });

    if (data.price + totalPaid === invoice.amount) {
      // update invoice status to paid
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: { status: "PAID" },
      });
    }

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "COMMANDREQUEST",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return payment;
  };

  // Create
  createDepense = async (
    data: Omit<Payment, "id" | "reference" | "status">,
    files: {
      proof?: Express.Multer.File[] | null;
      justification?: Express.Multer.File[] | null;
    },
  ) => {
    const { proof, justification } = files;
    const payment = await prisma.payment.create({
      data: {
        ...data,
        reference: `PAY-${Date.now()}`, // simple reference generation
        status: "pending_depense",
      },
      include: {
        beneficiary: true,
        model: true,
        bank: true,
      },
    });

    if (proof) {
      await storeDocumentsBulk(proof, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "PAYMENT",
      });
    }

    if (justification) {
      await storeDocumentsBulk(justification, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "PAYMENT",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("payment:new");
    return payment;
  };

  // Update
  update = async (id: number, data: Partial<Omit<Payment, "proof">>) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...data,
        isPartial: Boolean(data.isPartial),
      },
    });

    if (payment && payment.status === "paid" && payment.bankId)
      await prisma.bank.update({
        where: {
          id: payment.bankId ?? -1,
        },
        data: {
          balance: {
            decrement: payment.price,
          },
        },
      });

    getIO().emit("payment:update");
    return payment;
  };

  // Update
  validate = async (
    id: number,
    data: { userId: number },
    file: Express.Multer.File[] | null,
  ) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    // determine the signing mode for this payment from the back and payment type
    const paymentData = await prisma.payment.findFirstOrThrow({
      where: { id },
      include: { signer: true },
    });

    let signatair: (Signatair & { user: User[] }) | null = null;
    if (paymentData.bankId && paymentData.methodId) {
      signatair = await prisma.signatair.findFirst({
        where: {
          Bank: {
            id: paymentData?.bankId,
          },
          payTypes: { id: paymentData?.methodId },
        },
        include: {
          user: true,
        },
      });
    }

    let payment: Payment | null = null;

    if (signatair?.mode === "BOTH") {
      payment = await prisma.payment.update({
        where: { id },
        data: {
          status:
            signatair.user.length - 1 === paymentData.signer.length
              ? "signed"
              : "unsigned",
          signer: {
            connect: { id: data.userId },
          },
          signeDoc: file
            ? file.map((f) => f.path.replace(/\\/g, "/")).join(";")
            : null,
          signed: true,
        },
      });
    } else {
      payment = await prisma.payment.update({
        where: { id },
        data: {
          status: "signed",
          signer: {
            connect: { id: data.userId },
          },
          signed: true,
          signeDoc: file
            ? file.map((f) => f.path.replace(/\\/g, "/")).join(";")
            : null,
        },
      });
    }

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "COMMANDREQUEST",
      });
    }

    getIO().emit("payment:update");
    return payment;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "PAYMENT");
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const payment = await prisma.payment.delete({
      where: { id },
    });
    getIO().emit("payment:delete");
    return payment;
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<Payment[]>(`${this.CACHE_KEY}:all`);
    if (cached) return cached;

    const payment = await prisma.payment.findMany({
      include: {
        signer: true,
      },
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, payment, 90);

    return payment;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.payment.findUniqueOrThrow({
      where: { id },
    });
  };
}
