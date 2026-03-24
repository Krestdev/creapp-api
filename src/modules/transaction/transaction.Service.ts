import { Transaction, PrismaClient, Bank } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";

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
      status: string;
    },
    file: Express.Multer.File[] | null,
  ) => {
    const { from, to, paymentId, methodId, ...transak } = data;
    let fromBank: Bank | null = null;
    let toBank: Bank | null = null;

    // create the bank if the provider bank is an inverstor
    if (from) {
      fromBank = await prisma.bank.create({
        data: {
          ...from,
        },
      });
    } else {
      transak.fromBankId = Number(transak.fromBankId);
    }

    // create the bank if the destination bank is a service provider
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
      await CacheService.del(`payment:all`);
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: data.status,
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

    if (!!transak.fromBankId || transak.fromBankId === 0) {
      await prisma.bank
        .update({
          where: {
            id: transak.fromBankId,
          },
          data: {
            balance: {
              decrement: transak.amount,
            },
          },
        })
        .then((res) => {
          console.log(res);
        });
    }

    if ((!!transak.toBankId || transak.toBankId === 0) && !transak.fromBankId) {
      // in case of an investment
      await prisma.bank.update({
        where: {
          id: transak.toBankId,
        },
        data: {
          balance: {
            increment: transak.amount,
          },
        },
      });
    } else if (
      (!!transak.toBankId || transak.toBankId === 0) &&
      transak.Type === "TRANSFER" &&
      transak.fromBankId === 0
    ) {
      // in case of a transfer
      await prisma.bank.update({
        where: {
          id: transak.toBankId,
        },
        data: {
          balance: {
            increment: transak.amount,
          },
        },
      });
    }

    const transaction = paymentId
      ? await prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? toBank?.id,
            methodId: methodId ?? null,
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
            payement: true,
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
            payement: true,
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
    getIO().emit("transaction:new");
    return transaction;
  };

  // Create
  createApprovisionement = async (
    data: Transaction & {
      from: Bank;
      to?: Bank;
      paymentId?: number;
      methodId?: number | null;
      status: string;
      payments: number[];
    },
  ) => {
    const { from, to, paymentId, methodId, payments, ...transak } = data;
    let fromBank: Bank | null = null;

    // create the bank if the provider bank is an inverstor
    if (from) {
      fromBank = await prisma.bank.create({
        data: {
          ...from,
        },
      });
    } else {
      transak.fromBankId = Number(transak.fromBankId);
    }

    if (paymentId) {
      await CacheService.del(`payment:all`);
      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: data.status,
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

    // Provider Back is Valid and is CAISE, then decrement directly
    if (!!transak.fromBankId || transak.fromBankId === 0) {
      await prisma.bank.update({
        where: {
          id: transak.fromBankId,
        },
        data: {
          balance: {
            decrement: transak.amount,
          },
        },
      });
    }

    // destination bank is CAISE and provider bank is valid bank
    if ((!!transak.toBankId || transak.toBankId === 0) && !transak.fromBankId) {
      // in case of an investment
      await prisma.bank.update({
        where: {
          id: transak.toBankId,
        },
        data: {
          balance: {
            increment: transak.amount,
          },
        },
      });

      // destination bank is caise and the operation is a transfer else we do not increment directly
    } else if (
      (!!transak.toBankId || transak.toBankId === 0) &&
      transak.Type === "TRANSFER" &&
      transak.fromBankId === 0
    ) {
      // in case of a transfer
      await prisma.bank.update({
        where: {
          id: transak.toBankId,
        },
        data: {
          balance: {
            increment: transak.amount,
          },
        },
      });
    }

    const transaction = paymentId
      ? await prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? to?.id,
            methodId: methodId ?? null,
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
            payments: {
              connect: payments.map((id) => {
                return { id };
              }),
            },
          },
          include: {
            from: true,
            to: true,
            payement: true,
          },
        })
      : await prisma.transaction.create({
          data: {
            ...transak,
            fromBankId: transak.fromBankId ?? fromBank?.id,
            toBankId: transak.toBankId ?? to?.id,
            status:
              data.Type == "TRANSFER" && transak.status
                ? transak.status
                : data.Type == "TRANSFER"
                  ? "PENDING"
                  : "APPROVED",
            payments: {
              connect: payments.map((id) => {
                return { id };
              }),
            },
          },
          include: {
            from: true,
            to: true,
            payement: true,
          },
        });

    await prisma.payment.updateMany({
      where: {
        id: {
          in: payments,
        },
      },
      data: {
        selected: true,
      },
    });
    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("transaction:new");
    return transaction;
  };

  // Update
  update = async (
    id: number,
    data: Partial<Transaction>,
    paymentId: number | null,
    file: Express.Multer.File[] | null,
  ) => {
    if (data.amount) {
      data.amount = Number(data.amount);
    }

    if (paymentId && data.proof) {
      await CacheService.del(`payment:all`);
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "paid",
          proof: data.proof,
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

    if (data.status === "APPROVED")
      await prisma.bank.update({
        where: {
          id: transaction.toBankId,
        },
        data: {
          balance: {
            increment: transaction.amount,
          },
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
    getIO().emit("transaction:update");
    getIO().emit("bank:update");
    return transaction;
  };

  // Update
  sign = async (
    id: number,
    signDoc: string | null,
    userId: number,
    file: Express.Multer.File[] | null,
  ) => {
    const transactionInfo = await prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: { from: true, to: true, method: true, signers: true },
    });

    if (transactionInfo.methodId == null)
      throw Error("Payment method is required to sign the transaction");
    if (transactionInfo.fromBankId == null)
      throw Error("From Bank is required to sign the transaction");

    const signers = await prisma.signatair.findFirst({
      where: {
        payTypeId: transactionInfo.methodId,
        bankId: transactionInfo.fromBankId,
      },
      include: { user: true },
    });

    if (signers == null)
      throw Error("No signature method found for this payment method and bank");

    let transaction;
    if (signers.mode === "ONE") {
      transaction = await prisma.transaction.update({
        where: { id },
        data: {
          isSigned: true,
          signDoc,
          signers: {
            create: {
              userId: userId,
              signed: true,
            },
          },
        },
        include: {
          from: true,
          to: true,
          signers: {
            include: { user: true },
          },
        },
      });
    } else {
      transaction = await prisma.transaction.update({
        where: { id },
        data: {
          isSigned:
            transactionInfo.signers.length + 1 >= signers.user.length
              ? true
              : false,
          signDoc,
          signers: {
            create: {
              userId: userId,
              signed: true,
            },
          },
        },
        include: {
          from: true,
          to: true,
          signers: {
            include: { user: true },
          },
        },
      });
    }

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: transaction.id.toString(),
        ownerType: "TRANSACTION",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("transaction:update");
    return transaction;
  };

  // Update
  validate = async (
    id: number,
    data: { validatorId: number; status: string; reason: string },
  ) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const transaction = await prisma.transaction.update({
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

    if (transaction.status === "REJECTED")
      await prisma.bank.update({
        where: {
          id: transaction.fromBankId,
        },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });

    getIO().emit("transaction:update");
    return transaction;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "TRANSACTION");

    await CacheService.del(`${this.CACHE_KEY}:all`);
    const transaction = await prisma.transaction.delete({
      where: { id },
    });
    getIO().emit("transaction:delete");
    return transaction;
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
        method: true,
        signers: {
          include: { user: true },
        },
        payments: true,
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
        method: true,
        signers: true,
      },
    });
  };
}
