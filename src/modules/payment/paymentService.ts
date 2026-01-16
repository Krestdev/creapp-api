import { Payment, PrismaClient } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";

const prisma = new PrismaClient();

export class PaymentService {
  // Create
  create = async (
    data: Omit<Payment, "id" | "reference" | "status">,
    file: Express.Multer.File[] | null
  ) => {
    if (!data.commandId) {
      throw new Error("Command ID is required for payment");
    }

    const command = await prisma.command.findUniqueOrThrow({
      where: { id: data.commandId },
      include: {
        devi: {
          include: {
            element: true,
          },
        },
      },
    });

    const commandPayments = await prisma.payment.findMany({
      where: { commandId: data.commandId },
    });

    const totalPaid = commandPayments.reduce(
      (sum, payment) => sum + payment.price,
      0
    );

    const commandAmount = command.devi?.element.reduce(
      (sum, element) => sum + element.priceProposed * element.quantity,
      0
    );

    const remainingAmount = (commandAmount ?? 0) - totalPaid;

    if (data.price > remainingAmount) {
      throw new Error("Payment amount exceeds the remaining command amount");
    }

    if (remainingAmount === 0) {
      throw new Error("The command has already been fully paid");
    }

    if (data.price !== command.amountBase) {
      data.isPartial = true;
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        commandId: Number(data.commandId),
        reference: `PAY-${Date.now()}`, // simple reference generation
        status: "pending",
      },
    });

    if (data.price + totalPaid === command.amountBase) {
      // update command status to paid
      await prisma.command.update({
        where: { id: data.commandId },
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

    return payment;
  };

  // Create
  createDepense = async (
    data: Omit<Payment, "id" | "reference" | "status">,
    files: {
      proof?: Express.Multer.File[] | null;
      justification?: Express.Multer.File[] | null;
    }
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

    return payment;
  };

  // Update
  update = async (id: number, data: Partial<Omit<Payment, "proof">>) => {
    return prisma.payment.update({
      where: { id },
      data: {
        ...data,
        isPartial: Boolean(data.isPartial),
        requestId: Number(data.requestId),
      },
    });
  };

  // Update
  validate = async (id: number, data: { userId: number }) => {
    return prisma.payment.update({
      where: { id },
      data: {
        status: "signed",
        signerId: data.userId,
      },
    });
  };

  // Delete
  delete = (id: number) => {
    deleteDocumentsByOwner(id.toString(), "PAYMENT");
    return prisma.payment.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.payment.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.payment.findUniqueOrThrow({
      where: { id },
    });
  };
}
