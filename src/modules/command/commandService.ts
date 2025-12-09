import { Command, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CommandService {
  // Create
  create = (data: Command, requestIds: number[]) => {
    return prisma.command.create({
      data: {
        ...data,
        requests: {
          connect: requestIds.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // Update
  update = (id: number, data: Command) => {
    return prisma.command.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.command.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.command.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.command.findUniqueOrThrow({
      where: { id },
    });
  };
}
