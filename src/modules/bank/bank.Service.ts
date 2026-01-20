import { Bank, PrismaClient } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class BankService {
  // Create
  create = async (data: Bank, justification: Express.Multer.File[]) => {
    const bank = await prisma.bank.create({
      data,
    });

    if (justification) {
      await storeDocumentsBulk(justification, {
        role: "JUSTIFICATION",
        ownerId: bank.id.toString(),
        ownerType: "BANK",
      });
    }

    getIO().emit("bank:new");
    return bank;
  };

  // Update
  update = async (
    id: number,
    data: Partial<Bank>,
    justification: string | null,
    file: Express.Multer.File[] | null,
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

    if (justification) {
      await storeDocumentsBulk(file, {
        role: "JUSTIFICATION",
        ownerId: bank.id.toString(),
        ownerType: "BANK",
      });
    }

    getIO().emit("bank:update");
    return bank;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "BANK");
    const bank = await prisma.bank.delete({
      where: { id },
    });
    getIO().emit("bank:delete");
    return bank;
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
