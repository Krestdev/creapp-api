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
  // Create payment transaction
  createCreditTransaction = async (
    data: Transaction & {
      toBankId: number | null;
      from: Bank;
    },
    file: Express.Multer.File[] | null,
  ) => {
    const {
      from,
      toBankId,
      id,
      fromBankId,
      methodId,
      userId,
      validatorId,
      ...transak
    } = data;

    await CacheService.del(`payment:all`);
    // create the bank if the provider bank is an inverstor

    if (!toBankId) {
      throw Error("Recipient bank not found");
    }

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          ...transak,
          user: {
            connect: {
              id: Number(userId),
            },
          },
          to: {
            connect: {
              id: Number(toBankId),
            },
          },
          fromBankName: from.label,
          status: "APPROVED",
        },
        include: {
          from: true,
          to: true,
          payement: true,
        },
      }),
      prisma.bank.update({
        where: {
          id: Number(toBankId),
        },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      }),
    ]);

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

  private shouldDecrement = async (id: number, amount: number) => {
    const bank = await prisma.bank.findUnique({ where: { id } });
    if (!bank || !bank.balance || bank.balance - amount < 0) {
      return false;
    } else {
      return true;
    }
  };

  // Create payment transaction
  createDebitTransaction = async (
    data: Transaction & {
      fromBankId: number | null;
      to: Bank;
    },
    file: Express.Multer.File[] | null,
  ) => {
    const {
      to,
      toBankId,
      id,
      fromBankId,
      methodId,
      userId,
      validatorId,
      ...transak
    } = data;

    await CacheService.del(`payment:all`);
    // create the bank if the provider bank is an inverstor

    // verify the available amount befor decementing

    if (!fromBankId) {
      throw Error("Origin bank not found");
    }

    const okay = await this.shouldDecrement(
      Number(fromBankId),
      Number(data.amount),
    );
    if (!okay) {
      throw Error("Fond insufisant");
    }

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          ...transak,
          user: {
            connect: {
              id: Number(userId),
            },
          },
          from: {
            connect: {
              id: fromBankId,
            },
          },
          toBankName: to.label,
          status: "APPROVED",
        },
        include: {
          from: true,
          to: true,
          payement: true,
        },
      }),
      prisma.bank.update({
        where: {
          id: fromBankId,
        },
        data: {
          balance: {
            decrement: data.amount,
          },
        },
      }),
    ]);

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

  // Create payment transaction
  createPaymentTransaction = async (
    data: Transaction & {
      to: Bank;
      paymentId: number;
    },
    file: Express.Multer.File[] | null,
  ) => {
    const {
      to,
      paymentId,
      methodId,
      toBankId,
      id,
      fromBankId,
      userId,
      validatorId,
      ...transak
    } = data;

    await CacheService.del(`payment:all`);
    // create the bank if the provider bank is an inverstor

    const payement = await prisma.payment.update({
      where: {
        id: Number(paymentId),
      },
      data: {
        status: data.status!,
        method: methodId
          ? {
            connect: {
              id: Number(methodId),
            },
          }
          : {},
        bank: {
          connect: {
            id: Number(fromBankId),
          },
        },
        transaction: {
          create: {
            ...transak,
            user: {
              connect: {
                id: Number(userId),
              },
            },
            from: {
              connect: {
                id: Number(fromBankId),
              },
            },
            toBankName: to.label,
            status: "PENDING",
          },
        },
      },
      include: {
        transaction: {
          include: { payement: true },
        },
      },
    });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: payement.transactionId!.toString(),
        ownerType: "TRANSACTION",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("transaction:new");
    return payement.transaction!;
  };

  // Create Transfer
  createTransfer = async (data: Transaction) => {
    const okay = await this.shouldDecrement(
      Number(data.fromBankId),
      Number(data.amount),
    );
    if (!okay) {
      throw Error("Fond insufisant");
    }

    const [_, __, transaction] = await prisma.$transaction([
      prisma.bank.update({
        where: {
          id: data.fromBankId!,
        },
        data: {
          balance: {
            decrement: data.status === "APPROVED" ? data.amount : 0,
          },
        },
      }),
      prisma.bank.update({
        where: {
          id: data.toBankId!,
        },
        data: {
          balance: {
            increment: data.status === "APPROVED" ? data.amount : 0,
          },
        },
      }),
      prisma.transaction.create({
        data,
        include: {
          from: true,
          to: true,
          payement: true,
        },
      }),
    ]);

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

    // create the bank if the provider bank is an inverstor
    if (!from) {
      transak.fromBankId = Number(transak.fromBankId);
      const okay = await this.shouldDecrement(transak!.fromBankId, data.amount);
      if (!okay) {
        throw Error("Fond insufisant");
      }
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
          ...(transak.fromBankId ? { fromBankId: transak.fromBankId } : { fromBankName: from.label }),
          toBankId: transak.toBankId ?? to!.id,
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
          payementappro: {
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
          ...(transak.fromBankId ? { fromBankId: transak.fromBankId } : { fromBankName: from.label }),
          ...(transak.toBankId ? { toBankId: transak.toBankId } : { toBankName: to?.label ?? null }),
          status:
            data.Type == "TRANSFER" && transak.status
              ? transak.status
              : data.Type == "TRANSFER"
                ? "PENDING"
                : "APPROVED",
          payementappro: {
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

  // Update transfer
  updateTransfer = async (
    id: number,
    data: Partial<Transaction>,
    file: Express.Multer.File[] | null,
  ) => {
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
    getIO().emit("transaction:update");
    getIO().emit("bank:update");
    return transaction;
  };

  // Update
  updatePayment = async (
    id: number,
    proof: string | null,
    paymentId: number,
    file: Express.Multer.File[] | null,
  ) => {
    const payment = await prisma.payment.findFirstOrThrow({
      where: { id: paymentId },
      include: {
        transaction: true,
      },
    });

    let okay = true

    if (payment.transaction!.fromBankId !== null) {
      okay = await this.shouldDecrement(
        payment.transaction!.fromBankId,
        payment.price,
      );

      if (!okay) {
        throw Error("Fond insufisant");
      }
    }

    const transaction_v = await prisma.transaction.findFirst({
      where: { id },
      include: {
        from: true,
        to: true,
      },
    });

    const [_, transaction] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "paid",
          proof,
        },
      }),
      prisma.transaction.update({
        where: { id },
        data: {
          proof,
          status: "APPROVED",
          from: {
            update: {
              balance: {
                decrement: payment.price,
              },
            },
          },
          ...(transaction_v?.to ? {
            to: {
              update: {
                balance: {
                  increment: payment.price,
                },
              },
            },
          } : {})
        },
        include: {
          from: true,
          to: true,
        },
      }),
    ]);

    await CacheService.del(`payment:all`);

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
  completeTransfer = async (
    id: number,
    proof: string | null,
    date: string,
    file: Express.Multer.File[] | null,
  ) => {
    const tragetTransaction = await prisma.transaction.findFirstOrThrow({
      where: { id },
    });

    // const okay = await this.shouldDecrement(
    //   tragetTransaction.fromBankId,
    //   tragetTransaction.amount,
    // );
    // if (!okay) {
    //   throw Error("Fond insufisant");
    // }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        proof,
        status: "APPROVED",
        date: date,
        // from: {
        //   update: {
        //     balance: {
        //       decrement: tragetTransaction.amount,
        //     },
        //   },
        // },
        to: {
          update: {
            balance: {
              increment: tragetTransaction.amount,
            },
          },
        },
      },
      include: {
        from: true,
        to: true,
      },
    });

    await CacheService.del(`payment:all`);

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
  updateSign = async (id: number, data: Partial<Transaction>) => {
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

    if (transaction.status === "REJECTED" && transaction.fromBankId) {
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

      await prisma.payment.updateMany({
        where: {
          transactionId: id,
        },
        data: {
          selected: false,
        },
      });
    }
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

  approvisionement = async () => {
    return prisma.transaction.count({
      where: {
        Type: "TRANSFER",
        status: "PENDING"
      },
    });
  };


  // transaction && transaction.type === "TRANSFER"
  // && transaction.from.type === "BANK"
  // && transaction.to.type === "BANK"
  // && the user can sign in the bank method
  // && transaction.isSigned === false
  // && !transaction.signers.find(s=> s.userId === user.id)

  approvisionementBy = async (userId: number) => {
    const transaction = await prisma.transaction.findMany({
      where: {
        Type: "TRANSFER",
        methodId: {
          not: null,
        },
        from: {
          type: "BANK",
        },
        isSigned: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const signers = await prisma.signatair.findMany({
      include: { user: true },
    });

    const selectedTransactions = transaction.filter(t => {
      return signers.find((x) => x.bankId === t.fromBankId && x.payTypeId === t.methodId)
        ?.user?.some((u) => u.id === userId);

    })

    return selectedTransactions.length
  };

  getAcceptedTransaction = async () => {
    return await prisma.transaction.count({
      where: {
        Type: "TRANSFER",
        status: "ACCEPTED",
      },
    })
  }
}
