import { Notification, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificationService {
  // Create
  create = (data: Notification) => {
    return prisma.notification.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Notification) => {
    return prisma.notification.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.notification.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.notification.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.notification.findUniqueOrThrow({
      where: { id },
    });
  };
}
