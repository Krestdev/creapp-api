import { Accounting, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AccountingService {
  // Create
  create = (data: Accounting) => {
    return prisma.accounting.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Accounting) => {
    return prisma.accounting.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.accounting.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.accounting.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.accounting.findUniqueOrThrow({
      where: { id },
    });
  };
}
