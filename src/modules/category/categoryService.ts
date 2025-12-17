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

  updateCategory = (id: number, data: Category) => {
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
      },
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

  deleteCategory = (id: number) => {
    return prisma.category.delete({
      where: { id },
    });
  };
}
