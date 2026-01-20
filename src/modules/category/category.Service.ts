import { Category, PrismaClient } from "@prisma/client";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class CategoryService {
  // Category
  createCategory = async (
    data: Category,
    validators: { userId: number; rank: number }[],
  ) => {
    const manager = await prisma.role.findFirst({
      where: {
        label: "MANAGER",
      },
    });

    if (!manager) throw Error("MANAGER Role not created");

    await Promise.all(
      validators.map(async (x) => {
        // find manager Id
        return await prisma.user.update({
          where: {
            id: x.userId,
          },
          data: {
            role: {
              connect: {
                id: manager.id,
              },
            },
          },
        });
      }),
    );

    const category = await prisma.category.create({
      data: {
        ...data,
        validators: {
          createMany: {
            data: validators,
          },
        },
      },
    });
    getIO().emit("category:new");
    return category;
  };

  updateCategory = async (
    id: number,
    data: Category,
    validators: { userId: number; rank: number }[],
  ) => {
    const exValidators = await prisma.validator.findMany({
      where: {
        categoryId: id,
      },
    });

    // find manager Id
    const manager = await prisma.role.findFirst({
      where: {
        label: "MANAGER",
      },
    });
    if (!manager) throw Error("MANAGER Role not created");

    // fuse 2 arrays of numbers such that there is no repeting number
    const exValidatorIds = exValidators.map((x) => x.userId);
    const newValidatorIds = validators.map((x) => x.userId);
    const uniqueValidatorIds = [
      ...new Set([...exValidatorIds, ...newValidatorIds]),
    ];
    const newList = validators.map((x) => x.userId);

    Promise.all(
      uniqueValidatorIds.map(async (x) => {
        if (newList.includes(x)) {
          return await prisma.user.update({
            where: {
              id: x,
            },
            data: {
              role: {
                connect: {
                  id: manager.id,
                },
              },
            },
          });
        }
        return await prisma.user.update({
          where: {
            id: x,
          },
          data: {
            role: {
              disconnect: {
                id: manager.id,
              },
            },
          },
        });
      }),
    );

    await prisma.validator.deleteMany({
      where: {
        categoryId: id,
      },
    });

    const category = await prisma.category.update({
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
    getIO().emit("category:update");

    exValidatorIds
      .filter((x) => !newList.includes(x))
      .concat(newList.filter((x) => !exValidatorIds.includes(x)))
      .map((userId) => {
        getIO().emit("user:update", { userId, action: "data" });
      });

    return category;
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

  deleteCategory = async (id: number) => {
    const category = await prisma.category.delete({
      where: { id },
    });
    getIO().emit("category:delete");
    return category;
  };
}
