import { CommandConditions, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CommandConditionsService {
  // Create
  create = (data: CommandConditions) => {
    return prisma.commandConditions.create({
      data,
    });
  };

  // Update
  update = (id: number, data: CommandConditions) => {
    return prisma.commandConditions.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.commandConditions.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.commandConditions.findMany();
  };

  // Get all
  getMyNotif = (id: number) => {
    return prisma.commandConditions.findMany({
      where: {
        id,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.commandConditions.findUniqueOrThrow({
      where: { id },
    });
  };
}
