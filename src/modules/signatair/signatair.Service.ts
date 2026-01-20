import { PayType, PrismaClient, Signatair } from "@prisma/client";
import { getIO } from "../../socket";

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

    const signatair = await prisma.signatair.create({
      data: {
        ...restData,
        user: {
          connect: userIds.map((id) => {
            return { id };
          }),
        },
      },
    });
    getIO().emit("signatair:new");
    return signatair;
  };

  // Update
  update = async (id: number, data: Signatair & { userIds: number[] }) => {
    const { userIds, ...restData } = data;
    const signatair = await prisma.signatair.update({
      where: { id },
      data: {
        ...restData,
        user: {
          set: userIds.map((id) => {
            return { id };
          }),
        },
      },
    });
    getIO().emit("signatair:update");
    return signatair;
  };

  // Delete
  delete = async (id: number) => {
    const signatair = await prisma.signatair.delete({
      where: { id },
    });
    getIO().emit("signatair:delete");
    return signatair;
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
