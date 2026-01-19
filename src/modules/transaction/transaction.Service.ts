import { Transaction, PrismaClient, Bank } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";

const prisma = new PrismaClient();

export class TransactionService {
  CACHE_KEY = "transaction";
  // Create
  create = async (
    data: Transaction & {
      from: Bank;
      to?: Bank;
      paymentId?: number;
      methodId?: number | null;
    },
    file: Express.Multer.File[] | null,
  ) => {
    const { from, to, paymentId, methodId, ...transak } = data;
    let fromBank: Bank | null = null;
    let toBank: Bank | null = null;
    if (from) {
      fromBank = await prisma.bank.create({
        data: {
          ...from,
        },
      });
    } else {
      transak.fromBankId = Number(transak.fromBankId);
    }

    if (to) {
      toBank = await prisma.bank.create({
        data: {
          ...to,
        },
      });
    } else {
      transak.toBankId = Number(transak.toBankId);
    }

    if (paymentId) {
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "unsigned",
          method: methodId
            ? {
                connect: {
                  id: Number(methodId),
                },
              }
            : {},
          bank: {
            connect: {
              id: Number(data.fromBankId),
            },
          },
        },
      });
    }

    if (transak.toBankId)
      await prisma.$transaction([
        prisma.bank.update({
          where: {
            id: transak.fromBankId,
          },
          data: {
            balance: {
              decrement: transak.amount,
            },
          },
        }),
        prisma.bank.update({
          where: {
            id: transak.toBankId,
          },
          data: {
            balance: {
              increment: transak.amount,
            },
          },
        }),
      ]);
    else
      await prisma.$transaction([
        prisma.bank.update({
          where: {
            id: transak.fromBankId,
          },
          data: {
            balance: {
              decrement: transak.amount,
            },
          },
        }),
      ]);

    const transaction = paymentId
      ? await prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? toBank?.id,
            status:
              data.Type == "TRANSFER" && transak.status
                ? transak.status
                : data.Type == "TRANSFER"
                  ? "PENDING"
                  : "APPROVED",
            payement: {
              connect: {
                id: paymentId,
              },
            },
          },
          include: {
            from: true,
            to: true,
          },
        })
      : await prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? toBank?.id,
            status:
              data.Type == "TRANSFER" && transak.status
                ? transak.status
                : data.Type == "TRANSFER"
                  ? "PENDING"
                  : "APPROVED",
          },
          include: {
            from: true,
            to: true,
          },
        });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: transaction.id.toString(),
        ownerType: "TRANSACTION",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return transaction;
  };

  // Update
  update = async (
    id: number,
    data: Partial<Transaction>,
    proof: string | null,
    paymentId: number | null,
    file: Express.Multer.File[] | null,
  ) => {
    if (data.amount) {
      data.amount = Number(data.amount);
    }

    if (data.proof) {
      data.proof = proof;
    }

    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "paid",
        },
      });
    }
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        from: true,
        to: true,
      },
    });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: transaction.id.toString(),
        ownerType: "TRANSACTION",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return transaction;
  };

  // Update
  validate = async (
    id: number,
    data: { validatorId: number; status: string; reason: string },
  ) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    return prisma.transaction.update({
      where: { id },
      data: {
        status: data.status,
        reason: data.reason,
        validatorId: data.validatorId,
      },
      include: {
        from: true,
        to: true,
      },
    });
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "TRANSACTION");

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return prisma.transaction.delete({
      where: { id },
    });
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<Transaction[]>(
      `${this.CACHE_KEY}:all`,
    );
    if (cached) return cached;

    const transaction = await prisma.transaction.findMany({
      include: {
        from: true,
        to: true,
      },
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, transaction, 90);
    return transaction;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        from: true,
        to: true,
      },
    });
  };
}
