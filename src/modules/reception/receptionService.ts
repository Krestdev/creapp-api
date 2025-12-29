import { Reception, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReceptionService {
  // Create
  create = (data: Reception) => {
    return prisma.reception.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Reception) => {
    return prisma.reception.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.reception.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.reception.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.reception.findUniqueOrThrow({
      where: { id },
    });
  };
}
