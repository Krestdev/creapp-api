import { PaymentTicket, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PaymentTicketService {
  // Create
  create = (data: PaymentTicket) => {
    return prisma.paymentTicket.create({
      data,
    });
  };

  // Update
  update = (id: number, data: PaymentTicket) => {
    return prisma.paymentTicket.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.paymentTicket.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.paymentTicket.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.paymentTicket.findUniqueOrThrow({
      where: { id },
    });
  };
}
