import { PrismaClient, Provider } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";

const prisma = new PrismaClient();

export class ProviderService {
  CACHE_KEY = "provider";
  // Create
  create = async (
    data: {
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      status: boolean;
      carte_contribuable: string | null;
      acf: string | null;
      plan_localisation: string | null;
      commerce_registre: string | null;
      banck_attestation: string | null;
    },
    files: {
      carte_contribuable: Express.Multer.File[] | null;
      acf: Express.Multer.File[] | null;
      plan_localisation: Express.Multer.File[] | null;
      commerce_registre: Express.Multer.File[] | null;
      banck_attestation: Express.Multer.File[] | null;
    },
  ) => {
    const exist = await prisma.provider.findFirst({
      where: {
        name: data.name,
      },
    });
    if (exist?.id) {
      throw Error("Provider Exist");
    }
    const provider = await prisma.provider.create({
      data,
    });

    if (
      files &&
      (files.acf ||
        files.banck_attestation ||
        files.carte_contribuable ||
        files.commerce_registre ||
        files.plan_localisation)
    ) {
      const Docs = Object.values(files);
      Docs.map(async (file) => {
        if (file) {
          await storeDocumentsBulk(file, {
            role: "PROOF",
            ownerId: provider.id.toString(),
            ownerType: "COMMANDREQUEST",
          });
        }
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return provider;
  };

  // Update
  update = async (
    id: number,
    data: {
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      RCCM: string | null;
      NIU: string | null;
      regem: string | null;
      status: boolean;
      carte_contribuable: string | null;
      acf: string | null;
      plan_localisation: string | null;
      commerce_registre: string | null;
      banck_attestation: string | null;
    },
    files?: {
      carte_contribuable: Express.Multer.File[] | null;
      acf: Express.Multer.File[] | null;
      plan_localisation: Express.Multer.File[] | null;
      commerce_registre: Express.Multer.File[] | null;
      banck_attestation: Express.Multer.File[] | null;
    },
  ) => {
    const exist = await prisma.provider.findFirst({
      where: {
        name: data.name,
        id: {
          not: {
            in: [id],
          },
        },
      },
    });
    if (exist?.id) {
      throw Error("Provider Exist");
    }

    const provider = await prisma.provider.update({
      where: { id },
      data,
    });

    if (
      files &&
      (files.acf ||
        files.banck_attestation ||
        files.carte_contribuable ||
        files.commerce_registre ||
        files.plan_localisation)
    ) {
      const Docs = Object.values(files);
      console.log(files);
      Docs.map(async (file) => {
        if (file) {
          await storeDocumentsBulk(file, {
            role: "PROOF",
            ownerId: provider.id.toString(),
            ownerType: "COMMANDREQUEST",
          });
        }
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return provider;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "PROVIDER");
    await CacheService.del(`${this.CACHE_KEY}:all`);
    return prisma.provider.delete({
      where: { id },
    });
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<Provider[]>(`${this.CACHE_KEY}:all`);
    if (cached) return cached;

    const provider = await prisma.provider.findMany();

    await CacheService.set(`${this.CACHE_KEY}:all`, provider, 90);

    return provider;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.provider.findUniqueOrThrow({
      where: { id },
    });
  };
}
