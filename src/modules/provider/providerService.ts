import { PrismaClient } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";

const prisma = new PrismaClient();

export class ProviderService {
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
    }
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

    if (files) {
      let Docs = Object.values(files);
      Docs.map(async (file) => {
        await storeDocumentsBulk(file, {
          role: "PROOF",
          ownerId: provider.id.toString(),
          ownerType: "COMMANDREQUEST",
        });
      });
    }

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
    }
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

    if (files) {
      let Docs = Object.values(files);
      Docs.map(async (file) => {
        await storeDocumentsBulk(file, {
          role: "PROOF",
          ownerId: provider.id.toString(),
          ownerType: "COMMANDREQUEST",
        });
      });
    }

    return provider;
  };

  // Delete
  delete = (id: number) => {
    deleteDocumentsByOwner(id.toString(), "PROVIDER");
    return prisma.provider.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.provider.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.provider.findUniqueOrThrow({
      where: { id },
    });
  };
}
