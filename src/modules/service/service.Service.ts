import { Services, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ServiceService {
  // Create
  create = (data: Services & { users: number[] }) => {
    const { users, headId, id, ...ndata } = data;
    return prisma.services.create({
      data: {
        ...ndata,
        head: headId
          ? {
              connect: {
                id: headId,
              },
            }
          : {},
        users: {
          connect: users.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // add use to service
  addUsers = (serviceId: number, users: number[]) => {
    return prisma.services.update({
      where: {
        id: serviceId,
      },
      data: {
        users: {
          connect: users.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // add use to service
  removeUsers = (serviceId: number, users: number[]) => {
    return prisma.services.update({
      where: {
        id: serviceId,
      },
      data: {
        users: {
          disconnect: users.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // Update
  update = (id: number, data: Services) => {
    return prisma.services.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.services.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.services.findMany({
      include: {
        users: true,
        head: true,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.services.findUniqueOrThrow({
      where: { id },
    });
  };
}
