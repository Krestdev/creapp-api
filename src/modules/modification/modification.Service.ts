import { modification, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ModificationService {
  // Create
  create = (data: modification) => {
    return prisma.modification.create({
      data,
    });
  };

  // Update
  update = (id: number, data: modification) => {
    return prisma.modification.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.modification.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.modification.findMany();
  };

  // Get all
  getMyNotif = (id: number) => {
    return prisma.modification.findMany({
      where: {
        id,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.modification.findUniqueOrThrow({
      where: { id },
    });
  };
}
