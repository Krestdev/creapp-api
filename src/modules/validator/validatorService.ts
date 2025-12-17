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
      return prisma.validator.delete({
        where: {
          id,
        },
      });
    }
    throw Error("No validator in this category");
  };
}
