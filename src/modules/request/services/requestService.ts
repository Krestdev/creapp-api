import { PrismaClient, RequestModel } from "@prisma/client";

const prisma = new PrismaClient();

export class RequestService {
  create = (data: Omit<RequestModel, "createdAt" | "updatedAt">) => {
    return prisma.requestModel.create({
      data,
    });
  };
  update = (
    id: number,
    data: Partial<Omit<RequestModel, "createdAt" | "updatedAt">>
  ) => {
    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.description !== undefined)
      updateData.description = data.description;
    return prisma.requestModel.update({
      where: { id },
      data: updateData,
    });
  };
  getAll = () => {
    return prisma.requestModel.findMany();
  };
  getOne = (id: number) => {
    return prisma.requestModel.findUnique({
      where: { id },
    });
  };
  getMine = (id: number) => {
    return prisma.requestModel.findMany({
      where: {
        userId: id,
      },
    });
  };
  delete = (id: number) => {
    return prisma.requestModel.delete({
      where: { id },
    });
  };
}
