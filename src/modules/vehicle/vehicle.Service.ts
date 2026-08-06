import { PrismaClient, Vehicle } from "@prisma/client";
import { getIO } from "../../socket";
import { storeDocumentsBulk } from "../../utils/DocumentManager";
import { statsFilters } from "./vehicle.Controller";

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
  getStats = async (query: statsFilters) => {
    const { from, to, date } = query;

    const data = await prisma.vehicle.findMany({
      include: {
        requestModels: {
          ...(date === "today" && {
            where: {
              payments: {
                some: {
                  createdAt: {
                    gte: new Date(),
                    lte: new Date(),
                  },
                },
              },
            },
          }),
          ...(date === "week" && {
            where: {
              payments: {
                some: {
                  createdAt: {
                    gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                    lte: new Date(),
                  },
                },
              },
            },
          }),
          ...(date === "month" && {
            where: {
              payments: {
                some: {
                  createdAt: {
                    gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
                    lte: new Date(),
                  },
                },
              },
            },
          }),
          ...(date === "year" && {
            where: {
              payments: {
                some: {
                  createdAt: {
                    gte: new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000),
                    lte: new Date(),
                  },
                },
              },
            },
          }),
          ...(date === "custom" && from && to && {
            where: {
              payments: {
                some: {
                  createdAt: {
                    gte: new Date(from),
                    lte: new Date(to),
                  },
                },
              },
            },
          }),
          select: {
            payments: {
              select: {
                liters: true,
                price: true,
                status: true
              }
            }
          }
        },
      },
    });

    const statsPerVehicle = data.map((vehicle) => {
      const liters = vehicle.requestModels.reduce((acc, reqM) => acc + Number(reqM.payments.filter(p => ['paid', 'simple_signed'].includes(p.status)).reduce((a, b) => a + Number(b.liters), 0)), 0)

      const total = vehicle.requestModels.reduce((acc, reqM) => acc + Number(reqM.payments.filter(p => ['paid', 'simple_signed'].includes(p.status)).reduce((a, b) => a + Number(b.price), 0)), 0)

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
