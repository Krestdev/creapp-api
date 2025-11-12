import { Provider, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProviderService {
  // Create
  create = (data: Provider) => {
    return prisma.provider.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Provider) => {
    return prisma.provider.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.provider.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.provider.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.provider.findUniqueOrThrow({
      where: { id },
    });
  };
}
