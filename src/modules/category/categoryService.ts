import { Category, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CategoryService {
  // Category
  createCategory = (
    data: Category,
    validators: { userId: number; rank: number }[]
  ) => {
    return prisma.category.create({
      data: {
        ...data,
        validators: {
          createMany: {
            data: validators,
          },
        },
      },
    });
  };

  updateCategory = async (
    id: number,
    data: Category,
    validators: { userId: number; rank: number }[]
  ) => {
    await prisma.validator.deleteMany({
      where: {
        categoryId: id,
      },
    });
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        validators: {
          createMany: {
            data: validators,
          },
        },
      },
    });
  };

  getOneCategory = (id: number) => {
    return prisma.category.findUnique({
      where: { id },
    });
  };

  getAllCategories = () => {
    return prisma.category.findMany({
      include: {
        validators: true,
      },
    });
  };

  deleteCategory = (id: number) => {
    return prisma.category.delete({
      where: { id },
    });
  };
}
