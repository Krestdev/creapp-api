import { PayType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PayTypeService {
  // Create
  create = (data: PayType) => {
    return prisma.payType.create({
      data,
    });
  };

  // Update
  update = (id: number, data: PayType) => {
    return prisma.payType.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.payType.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.payType.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.payType.findUniqueOrThrow({
      where: { id },
    });
  };
}
