import { Transaction, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TransactionService {
  // Create
  create = (data: Transaction) => {
    return prisma.transaction.create({
      data,
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
