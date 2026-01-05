import { Bank, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BankService {
  // Create
  create = (data: Bank) => {
    return prisma.bank.create({
      data,
    });
  };

  // Update
  update = async (
    id: number,
    data: Partial<Bank>,
    justification: string | null
  ) => {
    if (data.balance) {
      data.balance = Number(data.balance);
    }
    if (justification) {
      data.justification = justification;
    }

    return prisma.bank.update({
      where: { id },
      data: {
        ...data,
      },
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.bank.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.bank.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.bank.findUniqueOrThrow({
      where: { id },
    });
  };
}
