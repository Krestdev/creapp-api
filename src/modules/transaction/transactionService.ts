import { Transaction, PrismaClient, Bank } from "@prisma/client";

const prisma = new PrismaClient();

export class TransactionService {
  // Create
  create = async (data: Transaction & { from?: Bank; to?: Bank }) => {
    const { from, to, ...transak } = data;
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

    return prisma.transaction.create({
      data: {
        ...transak,
        fromBankId: transak.fromBankId ?? fromBank?.id,
        toBankId: transak.toBankId ?? toBank?.id,
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
    proof: string | null
  ) => {
    if (data.amount) {
      data.amount = Number(data.amount);
    }

    if (data.proof) {
      data.proof = proof;
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
