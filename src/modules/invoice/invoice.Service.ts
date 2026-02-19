import { Invoice, PrismaClient, Signatair, User } from "@prisma/client";
import { getIO } from "../../socket";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";

const prisma = new PrismaClient();

export class InvoiceService {
  CACHE_KEY = "invoice";
  // Create
  create = async (
    data: Omit<
      Invoice,
      "id" | "reference" | "status" | "createdAt" | "updatedAt"
    >,
    file: Express.Multer.File[] | null,
  ) => {
    if (!data.commandId) {
      throw new Error("Command ID is required for invoice");
    }

    const command = await prisma.command.findUniqueOrThrow({
      where: { id: data.commandId },
      include: {
        devi: {
          include: {
            element: true,
          },
        },
      },
    });

    const commandInvoices = await prisma.invoice.findMany({
      where: { commandId: data.commandId },
    });

    const totalPaid = commandInvoices
      .filter((elm) => elm.status !== "CANCELLED")
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const commandAmount = command.netToPay;

    const remainingAmount = (commandAmount ?? 0) - totalPaid;

    if (data.amount > remainingAmount) {
      throw new Error("Invoice amount exceeds the remaining command amount");
    }

    if (remainingAmount === 0) {
      prisma.command.update({
        where: { id: data.commandId },
        data: {
          status: "PAID",
        },
      });
      throw new Error("The command has already been fully paid");
    }

    if (data.amount !== command.amountBase) {
      data.isPartial = true;
    }

    console.log(data);

    const invoice = await prisma.invoice
      .create({
        data: {
          ...data,
          commandId: Number(data.commandId),
          reference: `FACTURE-${Date.now()}`, // simple reference generation
          status: "UNPAID",
        },
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });

    if (data.amount + totalPaid === command.amountBase) {
      // update command status to paid
      await prisma.command.update({
        where: { id: data.commandId },
        data: { status: "PAID" },
      });
    }

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: invoice.id.toString(),
        ownerType: "COMMANDREQUEST",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return invoice;
  };

  // Update
  update = async (id: number, data: Partial<Omit<Invoice, "proof">>) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        isPartial: Boolean(data.isPartial),
      },
    });

    getIO().emit("invoice:update");
    return invoice;
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<Invoice[]>(`${this.CACHE_KEY}:all`);
    if (cached) return cached;

    const invoice = await prisma.invoice.findMany({
      include: {
        payment: true,
        command: {
          include: {
            provider: true,
            devi: {
              include: {
                commandRequest: true,
              },
            },
          },
        },
      },
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, invoice, 90);

    return invoice;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.invoice.findUniqueOrThrow({
      where: { id },
    });
  };
}
