import { Vehicle, PrismaClient } from "@prisma/client";
import { storeDocumentsBulk } from "../../utils/DocumentManager";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class VehicleService {
  // Create
  create = async (
    data: Omit<Vehicle, "createdAt" | "updatedAt" | "id">,
    file: Express.Multer.File[] | null,
  ) => {
    const vehicle = await prisma.vehicle.create({
      data,
    });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: vehicle.id.toString(),
        ownerType: "VEHICLE",
      });
    }

    getIO().emit("vehicle:new");
    return vehicle;
  };

  // Update
  update = async (id: number, data: Partial<Vehicle>) => {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });
    getIO().emit("vehicle:update");
    return vehicle;
  };

  // Delete
  delete = async (id: number) => {
    const vehicle = await prisma.vehicle.delete({
      where: { id },
    });
    getIO().emit("vehicle:delete");
    return vehicle;
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
