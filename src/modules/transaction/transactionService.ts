import { Transaction, PrismaClient, Bank } from "@prisma/client";

const prisma = new PrismaClient();

export class TransactionService {
  // Create
  create = async (
    data: Transaction & { from: Bank; to?: Bank; paymentId?: number }
  ) => {
    const { from, to, paymentId, ...transak } = data;
    let fromBank: Bank | null = null;
    let toBank: Bank | null = null;
    if (from) {
      fromBank = await prisma.bank.create({
        data: {
          ...from,
        },
      });
    } else {
      transak.fromBankId = Number(transak.fromBankId);
    }

    if (to) {
      toBank = await prisma.bank.create({
        data: {
          ...to,
        },
      });
    } else {
      transak.toBankId = Number(transak.toBankId);
    }

    if (paymentId) {
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "unsigned",
          bank: {
            connect: {
              id: Number(data.fromBankId),
            },
          },
        },
      });
    }

    console.log(transak);

    transak.toBankId
      ? await prisma.$transaction([
          prisma.bank.update({
            where: {
              id: transak.fromBankId,
            },
            data: {
              balance: {
                decrement: transak.amount,
              },
            },
          }),
          prisma.bank.update({
            where: {
              id: transak.toBankId,
            },
            data: {
              balance: {
                increment: transak.amount,
              },
            },
          }),
        ])
      : await prisma.$transaction([
          prisma.bank.update({
            where: {
              id: transak.fromBankId,
            },
            data: {
              balance: {
                decrement: transak.amount,
              },
            },
          }),
        ]);

    return paymentId
      ? prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? toBank?.id,
            status:
              data.Type == "TRANSFER" && transak.status
                ? transak.status
                : data.Type == "TRANSFER"
                ? "PENDING"
                : "APPROVED",
            payement: {
              connect: {
                id: paymentId,
              },
            },
          },
          include: {
            from: true,
            to: true,
          },
        })
      : prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? toBank?.id,
            status:
              data.Type == "TRANSFER" && transak.status
                ? transak.status
                : data.Type == "TRANSFER"
                ? "PENDING"
                : "APPROVED",
          },
          include: {
            from: true,
            to: true,
          },
        });
  };

  // Update
  update = async (
    id: number,
    data: Partial<Transaction>,
    proof: string | null,
    paymentId: number | null
  ) => {
    if (data.amount) {
      data.amount = Number(data.amount);
    }

    if (data.proof) {
      data.proof = proof;
    }

    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "paid",
        },
      });
    }

    return prisma.transaction.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        from: true,
        to: true,
      },
    });
  };

  // Update
  validate = async (
    id: number,
    data: { validatorId: number; status: string; reason: string }
  ) => {
    return prisma.transaction.update({
      where: { id },
      data: {
        status: data.status,
        reason: data.reason,
        validatorId: data.validatorId,
      },
      include: {
        from: true,
        to: true,
      },
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.transaction.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.transaction.findMany({
      include: {
        from: true,
        to: true,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        from: true,
        to: true,
      },
    });
  };
}
