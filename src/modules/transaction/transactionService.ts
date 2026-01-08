import { Transaction, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TransactionService {
  // Create
  create = (data: Transaction) => {
    return prisma.transaction.create({
      data,
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
      data.proof = data.proof;
    }

    return prisma.transaction.update({
      where: { id },
      data: {
        ...data,
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
    return prisma.transaction.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.transaction.findUniqueOrThrow({
      where: { id },
    });
  };
}
