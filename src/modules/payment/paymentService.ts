import { Payment, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PaymentService {
  // Create
  create = async (data: Omit<Payment, "id" | "reference" | "status">) => {
    // verify is the payment is
    // 0. command has been payed already
    // 1. complete payment of the command
    // 2. partial payment of the command
    // 3. if the payement amount is valid (<= command amount due)

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

    // console.log("Total paid:", totalPaid);
    // console.log("Remaining amount:", remainingAmount);
    // console.log("Payment amount:", data.price);
    // console.log("Command amount base:", command.amountBase);
    // console.log("Command:", command);

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

    return payment;
  };

  // Create
  createDepense = async (
    data: Omit<Payment, "id" | "reference" | "status">
  ) => {
    const payment = await prisma.payment.create({
      data: {
        ...data,
        reference: `PAY-${Date.now()}`, // simple reference generation
        status: "pending_depense",
      },
      include: {
        beneficiary: true,
        model: true,
      },
    });

    return payment;
  };

  // Update
  update = async (id: number, data: Omit<Payment, "proof">) => {
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
  validate = async (id: number, data: Payment) => {
    return prisma.payment.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
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
