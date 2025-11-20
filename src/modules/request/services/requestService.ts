import { Category, PrismaClient, RequestModel } from "@prisma/client";

const prisma = new PrismaClient();

export class RequestService {
  create = (
    data: Omit<RequestModel, "createdAt" | "updatedAt">,
    benList?: number[]
  ) => {
    const ref = "ref-" + new Date().getTime();
    return prisma.requestModel.create({
      data: {
        ...data,
        ref,
        beficiaryList: {
          connect: benList
            ? benList.map((beId) => {
                return { id: beId };
              })
            : [],
        },
      },
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

  validate = (id: number) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        state: "validated",
      },
    });
  };

  review = (id: number, data: { userId: number; validated: boolean }) => {
    return prisma.requestValidation.create({
      data: {
        validatorId: data.userId,
        requestId: id,
        decision: data.validated ? "validated" : "rejected",
      },
    });
  };

  reject = (id: number) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        state: "rejected",
      },
    });
  };

  priority = (id: number, priority: string) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        proprity: priority,
      },
    });
  };

  // add a submit state
  submit = (id: number) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        state: "submited",
      },
    });
  };

  // Category
  createCategory = (data: Category) => {
    return prisma.category.create({
      data: data,
    });
  };

  updateCategory = (id: number, data: Category) => {
    return prisma.category.update({
      where: { id },
      data: data,
    });
  };

  getOneCategory = (id: number) => {
    return prisma.category.findUnique({
      where: { id },
    });
  };

  getAllCategories = () => {
    return prisma.category.findMany();
  };

  getAllChildren = (parentId: number) => {
    return prisma.category.findMany({
      where: {
        parentId,
      },
    });
  };

  getAllSpecialCategory = (isSpecial: boolean) => {
    return prisma.category.findMany({
      where: {
        isSpecial,
      },
    });
  };
}
