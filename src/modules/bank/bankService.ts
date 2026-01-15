import { Bank, PrismaClient } from "@prisma/client";
import { storeDocumentsBulk } from "../../utils/DocumentManager";

const prisma = new PrismaClient();

export class BankService {
  // Create
  create = async (data: Bank, justification: Express.Multer.File[]) => {
    const bank = await prisma.bank.create({
      data,
    });

    let Docs;
    if (justification) {
      Docs = await storeDocumentsBulk(justification, {
        role: "JUSTIFICATION",
        ownerId: bank.id.toString(),
        ownerType: "BANK",
      });
    }

    return bank;
  };

  // Update
  update = async (
    id: number,
    data: Partial<Bank>,
    justification: string | null,
    file: Express.Multer.File[] | null
  ) => {
    if (data.balance) {
      data.balance = Number(data.balance);
    }
    if (justification) {
      data.justification = justification;
    }

    const bank = await prisma.bank.update({
      where: { id },
      data: {
        ...data,
      },
    });

    let Docs;
    if (justification) {
      Docs = await storeDocumentsBulk(file, {
        role: "JUSTIFICATION",
        ownerId: bank.id.toString(),
        ownerType: "BANK",
      });
    }

    return bank;
  };

  // Delete
  delete = (id: number) => {
    return prisma.bank.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.bank.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.bank.findUniqueOrThrow({
      where: { id },
    });
  };
}
