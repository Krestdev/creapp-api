import { Payment, PrismaClient, Signatair, User } from "@prisma/client";
import { getIO } from "../../socket";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { PaymentQueryOptions } from "./payment.Controller";

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
      await prisma.invoice.update({
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

    // if (data.price + totalPaid === invoice.amount) {
    //   // update invoice status to paid
    //   await prisma.invoice.update({
    //     where: { id: data.invoiceId },
    //     data: { status: "PAID" },
    //   });
    // }

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

    const prevPayment = await prisma.payment.findUnique({ where: { id } });

    if (!prevPayment) throw new Error("Provide a valid payment Id");

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...data,
        isPartial: Boolean(data.isPartial),
      },
    });

    // reject payment and invoice

    if (payment.invoiceId) {
      const invoicePayments = await prisma.payment.findMany({
        where: { invoiceId: payment.invoiceId },
      });

      const totalPaid = invoicePayments
        .filter(
          (elm) => !["pending", "cancelled", "rejected"].includes(elm.status),
        )
        .reduce((sum, payment) => sum + payment.price, 0);

      const invoice = await prisma.invoice.update({
        where: {
          id: payment.invoiceId,
        },
        data: {
          status: "UNPAID",
        },
      });

      if (totalPaid === invoice.amount) {
        // update invoice status to paid
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PAID" },
        });
      }
    }

    getIO().emit("payment:update");
    return payment;
  };

  // Update
  updateGas = async (id: number, data: Payment) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        price: data.price,
        liters: data.liters,
        deadline: data.deadline,
        benefId: data.benefId,
      },
    });

    getIO().emit("payment:update");
    return payment;
  };

  // Update
  updateSettle = async (id: number, data: Payment) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        price: data.price,
        deadline: data.deadline,
        benefId: data.benefId,
      },
    });

    getIO().emit("payment:update");
    return payment;
  };

  updateTransportPayment = async (id: number, data: Omit<Payment, "proof">) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);

    const prevPayment = await prisma.payment.findUnique({ where: { id } });

    if (!prevPayment) throw new Error("Provide a valid payment Id");

    const payment = await prisma.payment.update({
      where: { id },
      data,
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
  getAll = async ({ startDate, endDate, mount, provider, type, excludeType, priority, paymentMethod, matchBeneficiary, selected, date, state, paymentType, requestId, userId, limit, page }: PaymentQueryOptions) => {
    const payment = await prisma.payment.findMany({
      where: {
        ...(state && { status: state }),
        ...(paymentType && { paymentType }),
        ...(excludeType && { paymentType: { not: excludeType } }),
        ...(requestId && { requestId: +requestId }),
        ...(userId && { userId: +userId }),
        ...(mount && { price: { gte: mount } }),
        ...(provider && { provider }),
        ...(type && { paymentType: type }),
        ...(priority && { priority }),
        ...(paymentMethod && { methodId: Number(paymentMethod) }),
        ...(matchBeneficiary && {
          OR: [
            { benefId: Number(matchBeneficiary) },
            {
              request: {
                beficiaryList: {
                  some: {
                    id: Number(matchBeneficiary),
                  },
                },
              },
            },
          ]
        }),
        ...(selected && { id: Number(selected) }),
        ...(date && { createdAt: new Date(date) }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
      include: {
        signer: true,
        method: true,
        bank: true,
        request: true,
        facture: {
          include: {
            command: true,
          },
        },
      },
      ...(limit && { take: Number(limit) }),
      ...(limit && { skip: ((+page || 1) - 1) * Number(limit) }),
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.payment.count({
      where: {
        ...(state && { status: state }),
        ...(paymentType && { paymentType }),
        ...(requestId && { requestId: +requestId }),
        ...(userId && { userId: +userId }),
      },
    });

    const response = {
      payments: payment as Payment[],
      total: count,
    };

    return response;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.payment.findUniqueOrThrow({
      where: { id },
    });
  };

  // Get one
  getOneByRequestId = (requestId: number) => {
    return prisma.payment.findFirst({
      where: { requestId },
    });
  };

  // Get one
  paymentProof = async (
    id: number,
    path: string | null,
    file: Express.Multer.File[] | null,
  ) => {
    await storeDocumentsBulk(file, {
      role: "PROOF",
      ownerId: id.toString(),
      ownerType: "COMMANDREQUEST",
    });
    return prisma.payment.update({
      where: { id },
      data: {
        paymentProof: path,
      },
    });
  };

  getTicketsPendingCount = async () => {
    const payment = await prisma.payment.count({
      where: {
        type: {
          notIn: ["transport", "others", "gas"]
        },
        status: {
          in: ["pending", "accepted"]
        },
      },
    });
    return payment;
  };

  getPaymentToTreatCount = async () => {
    const payment = await prisma.payment.count({
      where: {
        status: {
          in: ["validate", "unsigned"]
        },
        type: "appro"
      },
    });
    return payment;
  };

  getPaymentToSignCount = async (userId: number) => {
    const payment = await prisma.payment.count({
      where: {
        method: {
          signatairs: {
            some: {
              user: {
                some: {
                  id: userId,
                }
              },
            },
          }
        },
        status: "unsigned",
        type: "appro"
      },
    });
    return payment;
  };
}
