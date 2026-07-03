import { Payment, Prisma, PrismaClient, Signatair, User } from "@prisma/client";
import { getIO } from "../../socket";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import {
  AccountantPaymentQueryParameter,
  DGPaymentQueryParameter,
  PaymentApproQueryParameter,
  PaymentQueryOptions,
  PaymentQueryParameter,
  PaymentSignQueryParameter,
} from "./payment.Controller";

const prisma = new PrismaClient();

export class PaymentService {
  CACHE_KEY = "payment";
  // Create
  create = async (
    data: Omit<Payment, "id" | "reference" | "status">,
    file: Express.Multer.File[] | null,
  ) => {
    if (!data.invoiceId) {
      throw new Error("Invoice ID is required for payment");
    }

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: data.invoiceId },
    });

    const invoicePayments = await prisma.payment.findMany({
      where: { invoiceId: data.invoiceId },
    });

    const totalPaid = invoicePayments
      .filter((elm) => elm.status !== "rejected" && elm.status !== "cancelled")
      .reduce((sum, payment) => sum + payment.price, 0);

    const remainingAmount = invoice.amount - totalPaid;

    if (data.price > remainingAmount) {
      throw new Error("Payment amount exceeds the remaining invoice amount");
    }

    if (remainingAmount === 0) {
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          status: "PAID",
        },
      });
      throw new Error("The invoice has already been fully paid");
    }

    if (data.price !== invoice.amount) {
      data.isPartial = true;
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        invoiceId: Number(data.invoiceId),
        reference: `PAY-${Date.now()}`, // simple reference generation
        status: "pending",
      },
    });

    // if (data.price + totalPaid === invoice.amount) {
    //   // update invoice status to paid
    //   await prisma.invoice.update({
    //     where: { id: data.invoiceId },
    //     data: { status: "PAID" },
    //   });
    // }

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "COMMANDREQUEST",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    return payment;
  };

  // Create
  createDepense = async (
    data: Omit<Payment, "id" | "reference" | "status">,
    files: {
      proof?: Express.Multer.File[] | null;
      justification?: Express.Multer.File[] | null;
    },
  ) => {
    const { proof, justification } = files;
    const payment = await prisma.payment.create({
      data: {
        ...data,
        reference: `PAY-${Date.now()}`, // simple reference generation
        status: "pending_depense",
      },
      include: {
        beneficiary: true,
        model: true,
        bank: true,
      },
    });

    if (proof) {
      await storeDocumentsBulk(proof, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "PAYMENT",
      });
    }

    if (justification) {
      await storeDocumentsBulk(justification, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "PAYMENT",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("payment:new");
    return payment;
  };

  // Update
  update = async (id: number, data: Partial<Omit<Payment, "proof">>) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);

    const prevPayment = await prisma.payment.findUnique({ where: { id } });

    if (!prevPayment) throw new Error("Provide a valid payment Id");

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...data,
        isPartial: Boolean(data.isPartial),
      },
    });

    // reject payment and invoice

    if (payment.invoiceId) {
      const invoicePayments = await prisma.payment.findMany({
        where: { invoiceId: payment.invoiceId },
      });

      const totalPaid = invoicePayments
        .filter(
          (elm) => !["pending", "cancelled", "rejected"].includes(elm.status),
        )
        .reduce((sum, payment) => sum + payment.price, 0);

      const invoice = await prisma.invoice.update({
        where: {
          id: payment.invoiceId,
        },
        data: {
          status: "UNPAID",
        },
      });

      if (totalPaid === invoice.amount) {
        // update invoice status to paid
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PAID" },
        });
      }
    }

    getIO().emit("payment:update");
    return payment;
  };

  // Update
  updateGas = async (id: number, data: Payment) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        price: data.price,
        liters: data.liters,
        deadline: data.deadline,
        benefId: data.benefId,
      },
    });

    getIO().emit("payment:update");
    return payment;
  };

  // Update
  updateSettle = async (id: number, data: Payment) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        price: data.price,
        deadline: data.deadline,
        benefId: data.benefId,
      },
    });

    getIO().emit("payment:update");
    return payment;
  };

  updateTransportPayment = async (id: number, data: Omit<Payment, "proof">) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);

    const prevPayment = await prisma.payment.findUnique({ where: { id } });

    if (!prevPayment) throw new Error("Provide a valid payment Id");

    const payment = await prisma.payment.update({
      where: { id },
      data,
    });

    getIO().emit("payment:update");
    return payment;
  };

  // Update
  validate = async (
    id: number,
    data: { userId: number },
    file: Express.Multer.File[] | null,
  ) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    // determine the signing mode for this payment from the back and payment type
    const paymentData = await prisma.payment.findFirstOrThrow({
      where: { id },
      include: { signer: true },
    });

    let signatair: (Signatair & { user: User[] }) | null = null;
    if (paymentData.bankId && paymentData.methodId) {
      signatair = await prisma.signatair.findFirst({
        where: {
          Bank: {
            id: paymentData?.bankId,
          },
          payTypes: { id: paymentData?.methodId },
        },
        include: {
          user: true,
        },
      });
    }

    let payment: Payment | null = null;

    if (signatair?.mode === "BOTH") {
      payment = await prisma.payment.update({
        where: { id },
        data: {
          status:
            signatair.user.length - 1 === paymentData.signer.length
              ? "signed"
              : "unsigned",
          signer: {
            connect: { id: data.userId },
          },
          signeDoc: file
            ? file.map((f) => f.path.replace(/\\/g, "/")).join(";")
            : null,
          signed: true,
        },
      });
    } else {
      payment = await prisma.payment.update({
        where: { id },
        data: {
          status: "signed",
          signer: {
            connect: { id: data.userId },
          },
          signed: true,
          signeDoc: file
            ? file.map((f) => f.path.replace(/\\/g, "/")).join(";")
            : null,
        },
      });
    }

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: payment.id.toString(),
        ownerType: "COMMANDREQUEST",
      });
    }

    getIO().emit("payment:update");
    return payment;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "PAYMENT");
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const payment = await prisma.payment.delete({
      where: { id },
    });
    getIO().emit("payment:delete");
    return payment;
  };

  // Get all
  getAll = async ({
    startDate,
    endDate,
    mount,
    provider,
    type,
    priority,
    paymentMethod,
    matchBeneficiary,
    selected,
    date,
    state,
    requestId,
    userId,
    limit,
    page,
  }: PaymentQueryOptions) => {
    const payment = await prisma.payment.findMany({
      where: {
        ...(state && { status: state }),
        ...(requestId && { requestId: +requestId }),
        ...(userId && { userId: +userId }),
        ...(mount && { price: { gte: mount } }),
        ...(provider && { facture: { command: { providerId: +provider } } }),
        ...(type && { type: type }),
        ...(priority && { priority }),
        ...(paymentMethod && { methodId: Number(paymentMethod) }),
        ...(matchBeneficiary && {
          OR: [
            { benefId: Number(matchBeneficiary) },
            {
              request: {
                beficiaryList: {
                  some: {
                    id: Number(matchBeneficiary),
                  },
                },
              },
            },
          ],
        }),
        ...(selected && { id: Number(selected) }),
        ...(date && { createdAt: new Date(date) }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
      include: {
        signer: true,
        method: true,
        bank: true,
        request: true,
        facture: {
          include: {
            command: true,
          },
        },
      },
      ...(limit && { take: Number(limit) }),
      ...(limit && { skip: ((+page || 1) - 1) * Number(limit) }),
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.payment.count({
      where: {
        ...(state && { status: state }),
        ...(requestId && { requestId: +requestId }),
        ...(userId && { userId: +userId }),
      },
    });

    const response = {
      payments: payment as Payment[],
      total: count,
    };

    return response;
  };

  // Get one
  getOne = async (id: number) => {
    const payment = await prisma.payment.findUniqueOrThrow({
      where: { id },
      include: {
        signer: true,
        method: true,
        request: true,
        transaction: true,
        facture: {
          include: {
            command: {
              include: {
                provider: true,
                facture: {
                  include: {
                    payment: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const totalPaid = payment.facture
      ? payment.facture.command.facture.reduce((acc, facture) => {
        const amount = facture.payment
          .filter((py) => py.status == "PAID")
          .reduce((acc, py) => acc + py.price, 0);
        return acc + amount;
      }, 0)
      : 0;

    const progress =
      payment.facture && payment.facture.command.netToPay
        ? (totalPaid * 100) / payment.facture.command.netToPay
        : 0;

    const newPayment = {
      ...payment,
      progress,
      totalPaid,
    };

    return newPayment;
  };

  // Get one
  getOneByRequestId = (requestId: number) => {
    return prisma.payment.findFirst({
      where: { requestId },
    });
  };

  // Get one
  paymentProof = async (
    id: number,
    path: string | null,
    file: Express.Multer.File[] | null,
  ) => {
    await storeDocumentsBulk(file, {
      role: "PROOF",
      ownerId: id.toString(),
      ownerType: "COMMANDREQUEST",
    });
    return prisma.payment.update({
      where: { id },
      data: {
        paymentProof: path,
      },
    });
  };

  getTicketsPendingCount = async () => {
    const payment = await prisma.payment.count({
      where: {
        type: {
          notIn: ["transport", "others", "gas"],
        },
        status: {
          in: ["pending", "accepted"],
        },
      },
    });
    return payment;
  };

  getPaymentToTreatCount = async () => {
    const payment = await prisma.payment.count({
      where: {
        status: {
          in: ["validated", "unsigned", "simple_signed", "signed"],
        },
        type: {
          not: "appro"
        },
      },
    });
    return payment;
  };

  getAllAppro = async (queryParams: PaymentApproQueryParameter) => {
    const { pageIndex, pageSize } = queryParams
    const payment = await prisma.payment.findMany({
      where: {
        method: {
          type: "cash"
        },
        type: {
          notIn: ["transaport", "gas", "settle"]
        },
        status: "validated",
        selected: false
      },
      skip: (pageIndex || 0) * (pageSize || 15),
      take: +pageSize || 15,
      orderBy: {
        createdAt: "desc",
      },
    })

    const paymentCount = await prisma.payment.count({
      where: {
        method: {
          type: "cash"
        },
        type: {
          notIn: ["transaport", "gas", "settle"]
        },
        status: "validated",
        selected: false
      }
    })

    return {
      data: payment,
      count: paymentCount,
    };
  }

  getPaymentToSignCount = async (userId: number) => {
    const payment = await prisma.payment.count({
      where: {
        method: {
          signatairs: {
            some: {
              user: {
                some: {
                  id: userId,
                },
              },
            },
          },
        },
        status: "unsigned",
        type: "appro",
      },
    });
    return payment;
  };

  getAllExpensesPayment = async (queryParams: PaymentQueryParameter) => {
    const {
      type,
      amount,
      amountType,
      provider,
      pageIndex,
      pageSize,
      tab,
      paymentMethod,
      beneficiary,
      isSelected,
      from,
      to,
      date,
      search,
      priority,
    } = queryParams;

    const FilterObject = {
      where: {
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        ...(beneficiary && {
          OR: [
            { beneficiary: { id: Number(beneficiary) } },
            {
              request: {
                OR: [
                  { beneficiary: String(beneficiary) },
                  {
                    beficiaryList: {
                      some: {
                        id: Number(beneficiary)
                      }
                    }
                  },
                  { userId: Number(beneficiary) }
                ]
              }
            }
          ]
        }),
        price: {
          ...(amountType === "greater" && amount
            ? { gte: Number(amount) }
            : amountType === "less" && amount
              ? { lte: Number(amount) }
              : amountType === "equal" && amount
                ? { equals: Number(amount) }
                : {}),
        },
        AND: [
          {
            ...(type ? {
              type: {
                equals: type
              }
            } : {}),
          },
          {
            type: {
              not: "appro"
            },
          }
        ],
        ...(tab === "validated"
          ? { status: { in: ["validated", "unsigned"] } }
          : tab === "processed"
            ? { status: { in: ["signed", "simple_signed"] } }
            : tab === "paid"
              ? { status: "paid" }
              : tab === "cancelled"
                ? { status: "cancelled" }
                : {}),
        ...(provider ? { facture: { command: { providerId: +provider } } } : {}),
        ...(paymentMethod ? {
          method: {
            type: paymentMethod
          }
        } : {}),
        ...(isSelected as unknown as string === "true" ? { selected: true } : {}),
        ...(isSelected as unknown as string === "false" ? { selected: false } : {}),
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
        ...(priority ? { priority: priority } : {}),
        createdAt:
          date === "custom" && from && to
            ? {
              gte: new Date(from),
              lte: new Date(to),
            }
            : date === "today"
              ? {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              }
              : date === "week"
                ? {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                }
                : date === "month"
                  ? {
                    gte: new Date(
                      new Date().setDate(new Date().getDate() - 30),
                    ),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  }
                  : date === "year"
                    ? {
                      gte: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1),
                      ),
                      lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                    : {},
      },
      include: {
        signer: true,
        method: true,
        request: {
          include: {
            beficiaryList: true
          },
        },
        transaction: true,
        facture: {
          include: {
            command: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
    }

    const payment = await prisma.payment.findMany({
      where: FilterObject.where,
      include: {
        ...FilterObject.include,
        transaction: {
          where: {
            Type: "TRANSFER"
          }
        }
      },
      skip: (pageIndex || 0) * (pageSize || 15),
      take: +pageSize || 15,
      orderBy: {
        createdAt: "desc",
      },
    });
    const paymentCount = await prisma.payment.count({
      where: FilterObject.where
    });

    return {
      data: payment,
      count: paymentCount,
    };
  };

  getAllExpensesStats = async (queryParams: PaymentQueryParameter) => {
    const {
      type,
      amount,
      amountType,
      provider,
      pageIndex,
      pageSize,
      tab,
      paymentMethod,
      beneficiary,
      isSelected,
      from,
      to,
      date,
      search,
      priority,
    } = queryParams;
    const payment = await prisma.payment.findMany({
      where: {
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        ...(beneficiary ? { beneficiary: { id: Number(beneficiary) } } : {}),
        ...(type ? { type: type } : {}),
        price: {
          ...(amountType === "greater" && amount
            ? { gte: Number(amount) }
            : amountType === "less" && amount
              ? { lte: Number(amount) }
              : amountType === "equal" && amount
                ? { equals: Number(amount) }
                : {}),
        },
        AND: [
          {
            ...(type ? {
              type: {
                equals: type
              }
            } : {}),
          },
          {
            type: {
              not: "appro"
            },
          }
        ],
        ...(tab === "validated"
          ? { status: { in: ["validated", "unsigned"] } }
          : tab === "processed"
            ? { status: { in: ["signed", "simple_signed"] } }
            : tab === "paid"
              ? { status: "paid" }
              : tab === "cancelled"
                ? { status: "cancelled" }
                : {}),
        ...(provider ? { facture: { command: { providerId: +provider } } } : {}),
        ...(paymentMethod ? {
          method: {
            type: paymentMethod
          }
        } : {}),
        ...(isSelected as unknown as string === "true" ? { selected: true } : {}),
        ...(isSelected as unknown as string === "false" ? { selected: false } : {}),
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
        ...(priority ? { priority: priority } : {}),
        createdAt:
          date === "custom" && from && to
            ? {
              gte: new Date(from),
              lte: new Date(to),
            }
            : date === "today"
              ? {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              }
              : date === "week"
                ? {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                }
                : date === "month"
                  ? {
                    gte: new Date(
                      new Date().setDate(new Date().getDate() - 30),
                    ),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  }
                  : date === "year"
                    ? {
                      gte: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1),
                      ),
                      lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                    : {},
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      validated: {
        count: payment.filter(
          (r) => r.status === "validated" || r.status === "unsigned",
        ).length,
        sum: payment
          .filter((r) => r.status === "validated" || r.status === "unsigned")
          .reduce((acc, r) => acc + r.price, 0),
      },
      processed: {
        count: payment.filter(
          (r) => r.status === "signed" || r.status === "simple_signed",
        ).length,
        sum: payment
          .filter((r) => r.status === "signed" || r.status === "simple_signed")
          .reduce((acc, r) => acc + r.price, 0),
      },
      paid: {
        count: payment.filter((r) => r.status === "paid").length,
        sum: payment
          .filter((r) => r.status === "paid")
          .reduce((acc, r) => acc + r.price, 0),
      },
      cancelled: {
        count: payment.filter((r) => r.status === "cancelled").length,
        sum: payment
          .filter((r) => r.status === "cancelled")
          .reduce((acc, r) => acc + r.price, 0),
      },
    };

    return stats;
  };


  getAllExpensesAccountantPayment = async (queryParams: AccountantPaymentQueryParameter) => {
    const {
      amount,
      amountType,
      provider,
      pageIndex,
      pageSize,
      tab,
      from,
      to,
      date,
      search,
      priority,
    } = queryParams;

    const FilterObject = {
      where: {
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        price: {
          ...(amountType === "greater" && amount
            ? { gte: Number(amount) }
            : amountType === "less" && amount
              ? { lte: Number(amount) }
              : amountType === "equal" && amount
                ? { equals: Number(amount) }
                : {}),
        },
        type: "achat",
        ...(tab === "pending"
          ? { status: { in: ["pending", "accepted"] } }
          : tab === "processed"
            ? { status: { in: ["unsigned", "validated", "signed", "simple_signed"] } }
            : tab === "paid"
              ? { status: "paid" }
              : tab === "cancelled"
                ? { status: "cancelled" }
                : {}),
        ...(provider ? { facture: { command: { providerId: +provider } } } : {}),
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
        ...(priority ? { priority: priority } : {}),
        createdAt:
          date === "custom" && from && to
            ? {
              gte: new Date(from),
              lte: new Date(to),
            }
            : date === "today"
              ? {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              }
              : date === "week"
                ? {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                }
                : date === "month"
                  ? {
                    gte: new Date(
                      new Date().setDate(new Date().getDate() - 30),
                    ),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  }
                  : date === "year"
                    ? {
                      gte: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1),
                      ),
                      lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                    : {},
      },
      include: {
        signer: true,
        method: true,
        request: true,
        transaction: true,
        facture: {
          select: {
            command: {
              select: {
                provider: { select: { name: true } },
                devi: {
                  select: {
                    commandRequest: { select: { title: true } }
                  }
                }
              },
            },
            amount: true,
            id: true
          },
        },
      },
    }

    const payment = await prisma.payment.findMany({
      ...FilterObject,
      skip: (pageIndex || 0) * (pageSize || 10),
      take: +pageSize || 15,
      orderBy: {
        createdAt: "desc",
      },
    });

    const paymentCount = await prisma.payment.count({
      where: FilterObject.where
    });

    return {
      data: payment,
      count: paymentCount,
    };
  };

  getAllExpensesAccountantPaymentStats = async (queryParams: AccountantPaymentQueryParameter) => {
    const {
      amount,
      amountType,
      provider,
      pageIndex,
      pageSize,
      tab,
      from,
      to,
      date,
      search,
      priority,
    } = queryParams;

    const FIlterObject = {
      where: {
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        price: {
          ...(amountType === "greater" && amount
            ? { gte: Number(amount) }
            : amountType === "less" && amount
              ? { lte: Number(amount) }
              : amountType === "equal" && amount
                ? { equals: Number(amount) }
                : {}),
        },
        type: "achat",
        ...(tab === "pending"
          ? { status: { in: ["pending", "accepted"] } }
          : tab === "processed"
            ? { status: { in: ["unsigned", "validated", "signed", "simple_signed"] } }
            : tab === "paid"
              ? { status: "paid" }
              : tab === "cancelled"
                ? { status: "cancelled" }
                : {}),
        ...(provider ? { facture: { command: { providerId: +provider } } } : {}),
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
        ...(priority ? { priority: priority } : {}),
        createdAt:
          date === "custom" && from && to
            ? {
              gte: new Date(from),
              lte: new Date(to),
            }
            : date === "today"
              ? {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              }
              : date === "week"
                ? {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                }
                : date === "month"
                  ? {
                    gte: new Date(
                      new Date().setDate(new Date().getDate() - 30),
                    ),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  }
                  : date === "year"
                    ? {
                      gte: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1),
                      ),
                      lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                    : {},
      },
    }

    const payment = await prisma.payment.findMany({
      ...FIlterObject,
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      pending: {
        count: payment.filter(
          (r) => r.status === "validated" || r.status === "unsigned",
        ).length,
        sum: payment
          .filter((r) => r.status === "validated" || r.status === "unsigned")
          .reduce((acc, r) => acc + r.price, 0),
      },
      processed: {
        count: payment.filter(
          (r) => r.status === "signed" || r.status === "simple_signed",
        ).length,
        sum: payment
          .filter((r) => r.status === "signed" || r.status === "simple_signed")
          .reduce((acc, r) => acc + r.price, 0),
      },
      paid: {
        count: payment.filter((r) => r.status === "paid").length,
        sum: payment
          .filter((r) => r.status === "paid")
          .reduce((acc, r) => acc + r.price, 0),
      },
      cancelled: {
        count: payment.filter((r) => r.status === "cancelled").length,
        sum: payment
          .filter((r) => r.status === "cancelled")
          .reduce((acc, r) => acc + r.price, 0),
      },
    };

    return stats;
  };

  getAllExpensesDGPayment = async (queryParams: DGPaymentQueryParameter) => {
    const {
      pageIndex,
      pageSize,
      tab,
      from,
      to,
      date,
      search,
      priority,
    } = queryParams;

    const FilterObject = {
      where: {
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        type: {
          notIn: ["transport", "gas", "others"],
        },
        ...(tab === "pending"
          ? { status: { in: ["pending", "accepted"] } }
          : tab === "processed"
            ? { status: { in: ["unsigned", "validated", "signed", "simple_signed"] } }
            : tab === "paid"
              ? { status: "paid" }
              : {
                status: {
                  notIn: ["cancelled", "ghost"]
                }
              }),
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
        ...(priority ? { priority: priority } : {}),
        createdAt:
          date === "custom" && from && to
            ? {
              gte: new Date(from),
              lte: new Date(to),
            }
            : date === "today"
              ? {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              }
              : date === "week"
                ? {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                }
                : date === "month"
                  ? {
                    gte: new Date(
                      new Date().setDate(new Date().getDate() - 30),
                    ),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  }
                  : date === "year"
                    ? {
                      gte: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1),
                      ),
                      lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                    : {},
      },
      include: {
        signer: true,
        method: true,
        request: true,
        transaction: true,
        facture: {
          select: {
            command: {
              select: {
                provider: { select: { name: true } },
                devi: {
                  select: {
                    commandRequest: { select: { title: true } }
                  }
                }
              },
            },
            amount: true,
            id: true
          },
        },
      },
    }

    const payment = await prisma.payment.findMany({
      ...FilterObject,
      skip: (pageIndex || 0) * (pageSize || 15),
      take: +pageSize || 15,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.payment.count({
      where: FilterObject.where,
    });

    return {
      data: payment,
      count: total,
    };
  };

  getAllExpensesDGPaymentStats = async (queryParams: DGPaymentQueryParameter) => {
    const {
      pageIndex,
      pageSize,
      tab,
      from,
      to,
      date,
      search,
      priority,
    } = queryParams;
    const payment = await prisma.payment.findMany({
      where: {
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        type: {
          notIn: ["transport", "gas", "others"],
        },
        ...(tab === "pending"
          ? { status: { in: ["pending", "accepted"] } }
          : tab === "processed"
            ? { status: { in: ["unsigned", "validated", "signed", "simple_signed"] } }
            : tab === "paid"
              ? { status: "paid" }
              : {
                status: {
                  notIn: ["cancelled", "ghost"]
                }
              }),
        ...(from ? { createdAt: { gte: from } } : {}),
        ...(to ? { createdAt: { lte: to } } : {}),
        ...(priority ? { priority: priority } : {}),
        createdAt:
          date === "custom" && from && to
            ? {
              gte: new Date(from),
              lte: new Date(to),
            }
            : date === "today"
              ? {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              }
              : date === "week"
                ? {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                }
                : date === "month"
                  ? {
                    gte: new Date(
                      new Date().setDate(new Date().getDate() - 30),
                    ),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                  }
                  : date === "year"
                    ? {
                      gte: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1),
                      ),
                      lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                    : {},
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const stats = {
      pending: {
        count: payment.filter(
          (r) => r.status === "validated" || r.status === "unsigned",
        ).length,
        sum: payment
          .filter((r) => r.status === "validated" || r.status === "unsigned")
          .reduce((acc, r) => acc + r.price, 0),
      },
      processed: {
        count: payment.filter(
          (r) => r.status === "signed" || r.status === "simple_signed",
        ).length,
        sum: payment
          .filter((r) => r.status === "signed" || r.status === "simple_signed")
          .reduce((acc, r) => acc + r.price, 0),
      },
      paid: {
        count: payment.filter((r) => r.status === "paid").length,
        sum: payment
          .filter((r) => r.status === "paid")
          .reduce((acc, r) => acc + r.price, 0),
      }
    };
    return stats;
  };


  getPaymentToSign = async (userId: number, queryParams: PaymentSignQueryParameter) => {
    const { tab, search, bank, priority, amount, amountType, pageIndex, pageSize } = queryParams

    const FilterObject = {
      where: {
        method: {
          signatairs: {
            some: {
              user: {
                some: {
                  id: userId,
                },
              },
            },
          },
        },
        ...(tab === "pending"
          ? { status: { in: ["unsigned"] } }
          : tab === "signed"
            ? { status: { in: ["signed", "paid"] } }
            : { status: "paid" }),
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        ...(bank ? { bankId: bank } : {}),
        ...(priority ? { priority: priority } : {}),
        price: {
          ...(amountType === "greater" && amount
            ? { gte: Number(amount) }
            : amountType === "less" && amount
              ? { lte: Number(amount) }
              : amountType === "equal" && amount
                ? { equals: Number(amount) }
                : {}),
        }
      },
      include: {
        transaction: {
          select: { docNumber: true }
        },
        bank: {
          select: { label: true }
        }
      },
    }

    const payment = await prisma.payment.findMany({
      ...FilterObject,
      skip: (pageIndex || 0) * (pageSize || 15),
      take: +pageSize || 15,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.payment.count({
      where: FilterObject.where,
    });

    return {
      data: payment,
      count: total,
    };
  };

  getPaymentToSignStat = async (userId: number, queryParams: PaymentSignQueryParameter) => {
    const { tab, search, bank, priority, amount, amountType } = queryParams
    const payment = await prisma.payment.findMany({
      where: {
        method: {
          signatairs: {
            some: {
              user: {
                some: {
                  id: userId,
                },
              },
            },
          },
        },
        ...(tab === "pending"
          ? { status: { in: ["unsinged"] } }
          : tab === "signed"
            ? { status: { in: ["signed", "paid"] } }
            : { status: "paid" }),
        ...(search ? { title: { contains: search, mode: "insensitive" as unknown as Prisma.QueryMode } } : {}),
        ...(bank ? { bankId: bank } : {}),
        ...(priority ? { priority: priority } : {}),
        price: {
          ...(amountType === "greater" && amount
            ? { gte: Number(amount) }
            : amountType === "less" && amount
              ? { lte: Number(amount) }
              : amountType === "equal" && amount
                ? { equals: Number(amount) }
                : {}),
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      pending: {
        count: payment.filter(
          (r) => r.status === "unsigned",
        ).length,
        sum: payment
          .filter((r) => r.status === "unsigned")
          .reduce((acc, r) => acc + r.price, 0),
      },
      signed: {
        count: payment.filter(
          (r) => r.status === "signed" || r.status === "paid",
        ).length,
        sum: payment
          .filter((r) => r.status === "signed" || r.status === "paid")
          .reduce((acc, r) => acc + r.price, 0),
      },
      paid: {
        count: payment.filter((r) => r.status === "paid").length,
        sum: payment
          .filter((r) => r.status === "paid")
          .reduce((acc, r) => acc + r.price, 0),
      }
    };

    return stats;
  };

  // tableaux de board
  getAllPaidPayments = async () => {
    const allPayments = await prisma.payment.findMany({
      where: {
        status: "paid",
      },
      include: {
        project: {
          select: {
            label: true
          },
        },
        facture: {
          select: {
            command: {
              select: {
                provider: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      total: allPayments.reduce((sum, payment) => sum + payment.price, 0),
      payments: allPayments.map(pay => {
        const { price, type, title, project, facture, status, createdAt } = pay
        return {
          price,
          type,
          title,
          status,
          project: project?.label,
          provider: facture?.command.provider.name,
          createdAt
        }
      })
    }
  };
}
