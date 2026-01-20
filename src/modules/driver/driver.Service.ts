import { PrismaClient, Driver } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class DriverService {
  CACHE_KEY = "driver";
  // Create
  create = async (
    data: {
      firstName: string;
      lastName: string | null;
      licence: string | null;
      idCard: string | null;
    },
    files: {
      licence: Express.Multer.File[] | null;
      idCard: Express.Multer.File[] | null;
    },
  ) => {
    const exist = await prisma.driver.findFirst({
      where: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    if (exist?.id) {
      throw Error("Driver Exist");
    }
    const driver = await prisma.driver.create({
      data,
    });

    if (files.idCard || files.licence) {
      const Docs = Object.values(files);
      Docs.map(async (file) => {
        if (file) {
          await storeDocumentsBulk(file, {
            role: "PROOF",
            ownerId: driver.id.toString(),
            ownerType: "DRIVER",
          });
        }
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("driver:new");
    return driver;
  };

  // Update
  update = async (
    id: number,
    data: {
      firstName: string;
      lastName: string | null;
      licence: string | null;
      idCard: string | null;
    },
    files?: {
      licence: Express.Multer.File[] | null;
      idCard: Express.Multer.File[] | null;
    },
  ) => {
    const exist = await prisma.driver.findFirst({
      where: {
        firstName: data.firstName,
        lastName: data.lastName,
        id: {
          not: {
            in: [id],
          },
        },
      },
    });
    if (exist?.id) {
      throw Error("Driver Exist");
    }

    const driver = await prisma.driver.update({
      where: { id },
      data,
    });

    if (files && (files?.idCard || files?.licence)) {
      const Docs = Object.values(files);
      Docs.map(async (file) => {
        if (file) {
          await storeDocumentsBulk(file, {
            role: "PROOF",
            ownerId: driver.id.toString(),
            ownerType: "DRIVER",
          });
        }
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("driver:update");
    return driver;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "DRIVER");
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const driver = await prisma.driver.delete({
      where: { id },
    });
    getIO().emit("driver:delete");
    return driver;
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<Driver[]>(`${this.CACHE_KEY}:all`);
    if (cached) return cached;

    const driver = await prisma.driver.findMany();

    await CacheService.set(`${this.CACHE_KEY}:all`, driver, 90);

    return driver;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.driver.findUniqueOrThrow({
      where: { id },
    });
  };
}
