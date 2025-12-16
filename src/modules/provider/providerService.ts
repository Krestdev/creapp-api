import { Provider, PrismaClient } from "@prisma/client";
import { MyFile } from "./providerController";

const prisma = new PrismaClient();

export class ProviderService {
  // Create
  create = async (data: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    taxId: string | null;
    rating: number;
    status: boolean;
    carte_contribuable: string | null;
    acf: string | null;
    plan_localisation: string | null;
    commerce_registre: string | null;
    banck_attestation: string | null;
  }) => {
    const exist = await prisma.provider.findFirst({
      where: {
        name: data.name,
      },
    });
    if (exist?.id) {
      throw Error("Provider Exist");
    }
    return prisma.provider.create({
      data,
    });
  };

  // Update
  update = async (
    id: number,
    data: {
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      taxId: string | null;
      rating: number;
      status: boolean;
      carte_contribuable: string | null;
      acf: string | null;
      plan_localisation: string | null;
      commerce_registre: string | null;
      banck_attestation: string | null;
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
    return prisma.provider.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
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
