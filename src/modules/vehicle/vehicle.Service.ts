import { Vehicle, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class VehicleService {
  // Create
  create = (data: Vehicle) => {
    return prisma.vehicle.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Vehicle) => {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.vehicle.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.vehicle.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.vehicle.findUniqueOrThrow({
      where: { id },
    });
  };
}
