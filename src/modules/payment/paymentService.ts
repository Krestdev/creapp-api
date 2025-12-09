import { Payment, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PaymentService {
  // Create
  create = (data: Payment) => {
    return prisma.payment.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Payment) => {
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
