import { PrismaClient, Provider } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";

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
      NIU: string | null;
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

    let valid = true;
    if (
      !files.acf ||
      !files.banck_attestation ||
      !files.carte_contribuable ||
      !files.commerce_registre ||
      !files.plan_localisation ||
      !data.phone ||
      !data.NIU
    ) {
      valid = false;
    }

    const provider = await prisma.provider
      .create({
        data: {
          ...data,
          valid,
        },
      })
      .catch((e) => {
        console.log(e);
        throw e;
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
    getIO().emit("provider:new");
    return provider;
  };

  // Update
  update = async (
    id: number,
    data: Partial<{
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
    }> & {
      name: string;
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

    const providerUp = await prisma.provider.update({
      where: { id },
      data,
    });

    let valid = true;
    if (
      !providerUp?.acf ||
      !providerUp?.banck_attestation ||
      !providerUp?.carte_contribuable ||
      !providerUp?.commerce_registre ||
      !providerUp?.plan_localisation ||
      !data.phone ||
      !data.NIU
    ) {
      // console.log(providerUp, data.phone, data.NIU);
      valid = false;
    }
    // console.log(valid);

    const provider = await prisma.provider.update({
      where: { id },
      data: {
        valid,
      },
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
      Docs.map(async (doc) => {
        if (doc !== null) {
          await storeDocumentsBulk(doc, {
            role: "PROOF",
            ownerId: provider.id.toString(),
            ownerType: "COMMANDREQUEST",
          });
        }
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("provider:update");
    return provider;
  };

  getValidProviders = async () => {
    return prisma.provider.findMany({
      where: {
        valid: true,
      },
    });
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "PROVIDER");
    await CacheService.del(`${this.CACHE_KEY}:all`);

    const data = await prisma.provider.findUnique({
      where: {
        id,
        commands: {
          every: {
            status: { in: ["PAID", "REJECTED"] },
          },
        },
        réceptions: {
          every: {
            Status: "COMPLETED",
          },
        },
      },
    });

    if (data) {
      const provider = await prisma.provider.delete({
        where: { id },
      });
      getIO().emit("provider:delete");
      return provider;
    } else {
      throw Error("Cannot Delete Provider with active processes");
    }
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
