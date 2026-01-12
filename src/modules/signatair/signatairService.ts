import { Signatair, PrismaClient, PayType, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class SignatairService {
  // Create
  create = async (data: Signatair & { userIds: number[] }) => {
    const { userIds, ...restData } = data;

    const signatairExist = await prisma.signatair.findFirst({
      where: {
        bankId: restData.bankId,
        payTypeId: restData.payTypeId,
      },
    });

    if (signatairExist) {
      throw Error("Un group de signatair existe deja pour ce type de payment");
    }

    return prisma.signatair.create({
      data: {
        ...restData,
        user: {
          connect: userIds.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // Update
  update = (id: number, data: Signatair & { userIds: number[] }) => {
    const { userIds, ...restData } = data;
    console.log(data);
    return prisma.signatair.update({
      where: { id },
      data: {
        ...restData,
        user: {
          set: data.userIds.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.signatair.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.signatair.findMany({
      include: {
        user: true,
        payTypes: true,
        Bank: true,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.signatair.findUniqueOrThrow({
      where: { id },
    });
  };
}

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
