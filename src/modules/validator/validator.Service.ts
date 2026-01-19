import { Validator, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ValidatorService {
  updateValidator = (id: number, data: Validator) => {
    return prisma.validator.update({
      where: { id },
      data: data,
    });
  };

  getValidatorByCategory = (id: number) => {
    return prisma.validator.findMany({
      where: { categoryId: id },
    });
  };

  getAllValidators = () => {
    return prisma.validator.findMany();
  };

  addValidatorToCategory = async (
    id: number,
    data: { userId: number; rank: number }
  ) => {
    const count = (await this.getValidatorByCategory(id)).length;
    // find manager Id
    const manager = await prisma.role.findFirst({
      where: {
        label: "MANAGER",
      },
    });

    if (!manager)
      throw Error("MANAGER Role not created, please create the role first");

    await prisma.user.update({
      where: { id: data.userId },
      data: {
        role: {
          connect: { id: manager.id },
        },
      },
    });

    if (count <= 3) {
      return prisma.validator.create({
        data: {
          ...data,
          categoryId: id,
        },
      });
    }
    throw Error("Can not have more than 3 validators in a category");
  };

  removeValidatorFromCategory = async (id: number) => {
    const count = (await this.getValidatorByCategory(id)).length;
    if (count > 0) {
      // find manager Id
      const manager = await prisma.role.findFirst({
        where: {
          label: "MANAGER",
        },
      });

      if (!manager) throw Error("MANAGER Role not created");

      const validator = await prisma.validator.delete({
        where: {
          id,
        },
      });

      await prisma.user.update({
        where: { id: validator.userId },
        data: {
          role: {
            disconnect: { id: manager.id },
          },
        },
      });

      return validator;
    }
    throw Error("No validator in this category");
  };
}
