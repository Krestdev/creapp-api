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

  // total de litres carburés
  // Litres carburés pour chaque véhicule
  // Total dépenses en carburant
  getStats = async () => {
    const data = await prisma.vehicle.findMany({
      include: {
        requestModels: {
          select: {
            liters: true,
            amount: true,
          }
        }
      },
    });

    const statsPerVehicle = data.map((vehicle) => {
      const liters = vehicle.requestModels.reduce((acc, requestModel) => acc + Number(requestModel.liters), 0)
      const total = vehicle.requestModels.reduce((acc, requestModel) => acc + Number(requestModel.amount), 0)
      return { vehicle: vehicle.id, liters: liters, total: total }
    });

    const globalVehicleStats = statsPerVehicle.reduce((acc, stat) => {
      return {
        liters: acc.liters + stat.liters,
        total: acc.total + stat.total
      }
    }, { liters: 0, total: 0 })

    return {
      statsPerVehicle,
      globalVehicleStats
    }
  };

  // .reduce((acc, r) => acc + r.price, 0)

  // Get one
  getOne = (id: number) => {
    return prisma.vehicle.findFirst({
      where: { id },
    });
  };
}
