import { Spending, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SpendingService {
  // Create
  create = (data: Spending) => {
    return prisma.spending.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Spending) => {
    return prisma.spending.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.spending.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.spending.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.spending.findUniqueOrThrow({
      where: { id },
    });
  };
}
