import { RequestType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class RequestTypeService {
  // Create
  create = (data: RequestType) => {
    return prisma.requestType.create({
      data,
    });
  };

  // Update
  update = (id: number, data: RequestType) => {
    return prisma.requestType.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.requestType.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.requestType.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.requestType.findUniqueOrThrow({
      where: { id },
    });
  };
}
