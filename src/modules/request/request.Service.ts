import {
  PayType,
  Prisma,
  PrismaClient,
  RequestModel,
  RequestPayType,
  RequestState,
  Validators
} from "@prisma/client";
import { getIO } from "../../socket";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { QueryString } from "./request.Controller";

const prisma = new PrismaClient();

export class RequestService {
  CACHE_KEY = "request";

  create = async (
    data: Omit<
      RequestModel,
      | "createdAt"
      | "updatedAt"
      | "driverId"
      | "km"
      | "liters"
      | "vehiclesId"
      | "serviceChiefId"
      | "decision"
      | "chiefDecision"
      | "isUsed"
    >,
    benList?: number[],
  ) => {
    const ref = "ref-" + new Date().getTime();

    const user = await prisma.user.findUnique({
      where: { id: data.userId! },
      include: {
        service: {
          include: {
            head: true,
          },
        },
      },
    });

    const category = await prisma.category.findUniqueOrThrow({
      where: {
        id: data.categoryId,
      },
      include: {
        validators: true,
        type: true,
      },
    });
    const validators = category.validators || [];

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    const request = await prisma.requestModel.create({
      data: {
        ...data,
        serviceChiefId: user?.service?.head?.id ?? null,
        decision: "PENDING",
        period: data.period
          ? JSON.parse(data.period as unknown as string)
          : null,
        benFac: data.benFac
          ? JSON.parse(data.benFac as unknown as string)
          : null,
        ref,
        requestOlds: {
          create: {
            unit: data.unit,
            quantity: data.quantity,
            priority: data.priority,
            amount: data.amount,
            dueDate: data.dueDate,
            user: {
              connect: {
                id: data.userId!,
              },
            },
          },
        },
        type: category.type.type,
        beficiaryList: {
          connect: benList
            ? benList.map((beId) => {
              return { id: beId };
            })
            : [],
        },
        validators: {
          createMany: {
            data: validators.map((vldr) => ({
              userId: vldr.userId,
              rank: vldr.rank,
              validated: false,
            })),
          },
        },
      },
      include: {
        validators: true,
      },
    });

    getIO().emit("request:new", { userId: request.userId });
    return request;
  };

  // updated with paytype
  takeAction = async (id: number, decision: string, userId: number) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);

    const request = await prisma.requestModel.update({
      where: { id },
      data:
        decision === "REJETED"
          ? {
            decision: decision as RequestState,
            state: "rejected",
          }
          : {
            decision: decision as RequestState,
          },
    });

    const shouldValidate = await prisma.requestModel.findMany({
      where: {
        serviceChiefId: userId,
        decision: {
          notIn: ["APPROVED", "REJECTED"],
        },
        servicechief: {
          is: null,
        },
      },
    });

    if (shouldValidate.length <= 0) {
      await prisma.user.updateMany({
        where: { id: userId },
        data: {
          shouldValidate: true,
        },
      });
    }

    getIO().emit("request:update");
    return prisma.requestModel.findUnique({
      where: { id: request.id },
      include: { requestOlds: true },
    });
  };

  // add use to service
  chiefrequests = (chiefId: number) => {
    return prisma.requestModel.findMany({
      where: {
        serviceChiefId: chiefId,
      },
      include: {
        validators: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  getPendingRequests = async ({ userId }: { userId: number }) => {
    const requests = await prisma.requestModel.findMany({
      include: {
        validators: true,
      },
      where: {
        state: "pending",
        validators: {
          some: {
            userId,
            validated: false,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pendingRequests = requests.filter((request) => {
      const currentValidator = request.validators.find(
        (v) => v.userId === userId,
      );

      if (!currentValidator) return false;

      // Rank 1 can validate immediately
      if (currentValidator.rank === 1) {
        return true;
      }

      // Previous validator must already validate
      const previousValidator = request.validators.find(
        (v) => v.rank === currentValidator.rank - 1,
      );

      return previousValidator?.validated === true;
    });

    return pendingRequests.length;
  };

  // updated with paytype
  update = async (
    id: number,
    data: Partial<Omit<RequestModel, "createdAt" | "updatedAt">>,
    authUserId: number,
    benList?: number[],
  ) => {
    const updateData: any = {};
    const {
      label,
      description,
      priority,
      quantity,
      unit,
      amount,
      dueDate,
      ...ndata
    } = data;
    if (data.label !== undefined) updateData.label = label;
    if (data.description !== undefined) updateData.description = description;
    if (data.priority !== undefined) updateData.priority = priority;
    if (data.quantity !== undefined) updateData.quantity = quantity;
    if (data.unit !== undefined) updateData.unit = unit;
    if (data.amount !== undefined) updateData.amount = amount;
    if (data.dueDate !== undefined) updateData.dueDate = dueDate;

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);

    const oldRequest = await prisma.requestModel.findUniqueOrThrow({
      where: { id },
    });

    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        ...updateData,
        ...ndata,
        beficiaryList: {
          connect: benList
            ? benList.map((beId) => {
              return { id: beId };
            })
            : [],
        },
      },
    });

    await prisma.requestOld.create({
      data: {
        unit: updateData.unit ? oldRequest.unit : null,
        quantity: updateData.quantity ? oldRequest.quantity : null,
        priority: updateData.priority ? oldRequest.priority : null,
        amount: updateData.amount ? oldRequest.amount : null,
        dueDate: updateData.dueDate ? oldRequest.dueDate : null,
        request: {
          connect: { id: request.id },
        },
        user: {
          connect: {
            id: authUserId,
          },
        },
      },
    });

    getIO().emit("request:update");
    return prisma.requestModel.findUnique({
      where: { id: request.id },
      include: { requestOlds: true },
    });
  };

  getAll = async (query?: QueryString) => {
    const {
      pageIndex,
      pageSize,
      search,
      user,
      category,
      project,
      status,
      type,
      from,
      to,
      date,
    } = query || {};

    const FilterObject = {
      where: {
        ...(search && {
          OR: [
            {
              label: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode
              },
            },
            {
              ref: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode
              },
            },
          ],
        }),
        user: user
          ? {
            id: +user,
          }
          : {},
        category: category
          ? {
            id: +category,
          }
          : {},
        project: project
          ? {
            id: +project,
          }
          : {},
        state: status
          ? {
            equals: status,
          }
          : {},
        type: type
          ? {
            equals: type,
          }
          : {},
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
        beficiaryList: {
          omit: {
            password: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            phone: true,
            verificationOtp: true,
          },
        },
        requestOlds: true,
        validators: true,
        category: {
          select: {
            label: true,
          },
        },
        project: {
          select: {
            label: true,
          },
        },
        // payments: true,
        user: {
          select: {
            firstName: true,
          },
        },
      },
    }

    const allRequests = await prisma.requestModel.findMany({
      ...FilterObject,
      // take: filters?.pageSize || 10,
      skip: (pageIndex || 0) * (pageSize || 15),
      take: pageSize ? Number(pageSize) : 15,
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.requestModel.count({ where: FilterObject.where })

    return {
      data: allRequests,
      total: count,
    };
  };

  getStats = async (query?: QueryString) => {
    const {
      pageIndex,
      pageSize,
      header,
      section,
      reviewer,
      search,
      user,
      category,
      project,
      status,
      type,
      from,
      to,
      date,
    } = query || {};

    const FilterObject = {
      where: {
        label: search
          ? {
            contains: search,
          }
          : {},
        user: user
          ? {
            id: +user,
          }
          : {},
        category: category
          ? {
            id: +category,
          }
          : {},
        project: project
          ? {
            id: +project,
          }
          : {},
        state: status
          ? {
            equals: status,
          }
          : {},
        type: type
          ? {
            equals: type,
          }
          : {},
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

    const allRequests = await prisma.requestModel.findMany({
      ...FilterObject,
      // take: filters?.pageSize || 10,
      skip: (pageIndex || 0) * (pageSize || 10),
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalSent = await prisma.requestModel.count();

    const stats = {
      awaiting: allRequests.filter((r) => r.state === "pending").length,
      rejected: allRequests.filter((r) => r.state === "rejected").length,
      validated: allRequests.filter((r) => r.state === "validated").length,
      fromStore: allRequests.filter((r) => r.state === "store").length,
      cancelled: allRequests.filter((r) => r.state === "cancel").length,
      sent: totalSent,
    };

    return stats;
  };

  getAllRequestsHavingPayment = async () => {
    // get all requests with at list one payment and that payment is in the validated state
    const allRequests = await prisma.requestModel.findMany({
      where: {
        payments: {
          some: {
            status: "validated",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return allRequests;
  };

  getChiefRequests = async ({ userId }: { userId: number }) => {
    const requests = await prisma.requestModel.findMany({
      include: {
        validators: true,
      },
      where: {
        state: "pending",
        decision: "PENDING",
        chiefDecision: null,
        validators: {
          some: {
            userId,
            validated: false,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pendingRequests = requests.filter((request) => {
      const currentValidator = request.validators.find(
        (v) => v.userId === userId,
      );

      if (!currentValidator) return false;

      // Rank 1 can validate immediately
      if (currentValidator.rank === 1) {
        return true;
      }

      // Previous validator must already validate
      const previousValidator = request.validators.find(
        (v) => v.rank === currentValidator.rank - 1,
      );

      return previousValidator?.validated === true;
    });

    return pendingRequests.length;
  };

  // tableaux de board
  getAllRequestStats = async ({ userId }: { userId: number }) => {
    const allRequests = await prisma.requestModel.findMany({
      where: {
        state: { not: "cancel" },
        userId,
      },
      include: {
        validators: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      awaiting: allRequests.filter(
        (r) =>
          r.state === "pending" &&
          r.decision === "PENDING" &&
          r.validators.some((v) => v.userId === userId && !v.validated),
      ).length,
      rejected: allRequests.filter(
        (r) =>
          r.state === "rejected" &&
          r.decision === "REJECTED" &&
          r.validators.some((v) => v.userId === userId && !v.validated),
      ).length,
      submited: allRequests.filter(
        (r) => r.state !== "cancel" && r.userId === userId,
      ).length,
      approved: allRequests.filter(
        (r) => ["store", "validated"].includes(r.state) && r.userId === userId,
      ).length,
      approvedTotal: allRequests.filter((r) =>
        ["store", "validated"].includes(r.state),
      ).length,
      total: allRequests.filter((r) => r.state !== "cancel").length,
    };
  };

  // tableaux de board
  getAllRequestGraphs = async ({ userId }: { userId: number }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    const allRequests = await prisma.requestModel.findMany({
      where: {
        state: { not: "cancel" },
        // if user role is ADMIN or SUPER_ADMIN get all requests else get only user requests
        ...(user?.role.find((r: any) => r.label === "ADMIN" || r.label === "SUPERADMIN") == null && { userId }),
      },
      include: {
        validators: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      submited: allRequests
        .filter((r) => r.state !== "cancel" && r.userId === userId)
        .map((req) => {
          return {
            state: req.state,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
          };
        }),
      validator: allRequests
        .filter(
          (r) =>
            r.state !== "cancel" &&
            r.validators.some((v) => v.userId === userId && !v.validated),
        )
        .map((req) => {
          return {
            state: req.state,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
          };
        }),
      all: allRequests
        .map((req) => {
          return {
            state: req.state,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
          };
        }),
    };
  };

  getUsableRequests = async () => {
    return await prisma.requestModel.count({
      where: {
        state: "validated",
        type: "achat",
        commandRequestId: null,
      },
    });
  };

  getOne = (id: number) => {
    return prisma.requestModel.findUnique({
      where: { id },
      include: {
        requestOlds: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        beficiaryList: true,
        validators: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });
  };

  getForQuotation = async () => {
    return prisma.requestModel.findMany({
      where: {
        type: "achat",
        state: "validated",
        commandRequestId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  getMyValidator = async (id: number, query?: QueryString) => {
    const {
      pageIndex,
      pageSize,
      search,
      user,
      tab,
      category,
      project,
      status,
      type,
      from,
      to,
      date,
    } = query || {};

    const FilterObject = {
      where: {
        // AND: [
        //   {
        //     chiefDecision: {
        //       not: null
        //     }
        //   },
        //   {
        //     serviceChiefId: {
        //       not: null
        //     }
        //   }
        // ],
        validators: {
          some: {
            AND: [
              { userId: id },
              (tab === "pending" ? { validated: false } : {}),
            ]
          },
        },
        ...(tab === "pending"
          ? {
            state: { in: ["pending"] }
          }
          : tab === "processed"
            ? { state: { in: ["store", "validated", "rejected"] } }
            : {}),
        ...(search && {
          OR: [
            {
              label: {
                contains: search,
              },
            },
            {
              ref: {
                contains: search,
              },
            },
          ],
        }),
        user: user
          ? {
            id: +user,
          }
          : {},
        category: category
          ? {
            id: +category,
          }
          : {},
        project: project
          ? {
            id: +project,
          }
          : {},
        state: status
          ? {
            equals: status,
          }
          : {},
        type: type
          ? {
            equals: type,
          }
          : {},
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
        beficiaryList: {
          omit: {
            password: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            phone: true,
            verificationOtp: true,
          },
        },
        requestOlds: true,
        validators: true,
        category: {
          select: {
            label: true,
          },
        },
        project: {
          select: {
            label: true,
          },
        },
        // payments: true,
        user: {
          select: {
            firstName: true,
          },
        },
      },
    }

    const requests = await prisma.requestModel.findMany({
      ...FilterObject,
      // where:{
      //   AND:[
      //     {state: {notIn: ["pending"]}},
      //     {chiefDecision: {not: null}},
      //   ],
      //   serviceChiefId: {
      //     not: null
      //   }
      // },
      // take: filters?.pageSize || 10,
      skip: (pageIndex || 0) * (pageSize || 15),
      take: pageSize ? Number(pageSize) : 15,
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.requestModel.count({
      where: FilterObject.where,
    });

    return {
      data: this.approbatorRequests(requests, id, tab).filter(filter => filter.serviceChiefId && filter.chiefDecision == null ? false : true).filter((r) => r.validators.slice(0, pageSize || 10)),
      total: count,
    };
  };

  getMyValidatorStat = async (id: number, query?: QueryString) => {
    const {
      pageIndex,
      pageSize,
      search,
      user,
      tab,
      category,
      project,
      status,
      type,
      from,
      to,
      date,
    } = query || {};

    const FilterObject = {
      where: {
        validators: {
          some: {
            AND: [
              { userId: id },
              (tab === "pending" ? { validated: false } : {}),
            ]
          },
        },
        ...(tab === "pending"
          ? { status: { in: ["pending"] } }
          : tab === "processed"
            ? { status: { in: ["store", "validated", "rejected"] } }
            : {}),
        ...(search && {
          OR: [
            {
              label: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode
              },
            },
            {
              ref: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode
              },
            },
          ],
        }),
        user: user
          ? {
            id: +user,
          }
          : {},
        category: category
          ? {
            id: +category,
          }
          : {},
        project: project
          ? {
            id: +project,
          }
          : {},
        state: status
          ? {
            equals: status,
          }
          : {},
        type: type
          ? {
            equals: type,
          }
          : {},
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
        beficiaryList: {
          omit: {
            password: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            phone: true,
            verificationOtp: true,
          },
        },
        requestOlds: true,
        validators: true,
        category: {
          select: {
            label: true,
          },
        },
        project: {
          select: {
            label: true,
          },
        },
        // payments: true,
        user: {
          select: {
            firstName: true,
          },
        },
      },
    }

    const requests = await prisma.requestModel.findMany({
      ...FilterObject,
      // take: filters?.pageSize || 10,
      skip: (pageIndex || 0) * (pageSize || 10),
      orderBy: {
        createdAt: "desc",
      },
    });

    const approbatorRequests = this.approbatorRequests(requests, id).filter(filter => filter.serviceChiefId && filter.chiefDecision == null ? false : true);

    const stats = {
      awaiting: approbatorRequests.filter((r) => r.state === "pending").length,
      processed: approbatorRequests.filter((r) => r.state === "proccessed").length,
      validated: approbatorRequests.filter((r) => r.state === "validated").length,
      rejected: requests.filter((r) => r.state === "rejected").length,
      total: requests.length,
    };

    return stats;
  };

  approbatorRequests = (
    requests: Array<RequestModel & { validators: Validators[] }>,
    userId?: number,
    tab?: "pending" | "processed",
  ): Array<RequestModel & { validators: Validators[] }> => {
    if (!userId) return [];
    const res = requests.filter((r) => {
      const validator = r.validators.find((u) => u.userId === userId);
      const myRank = validator?.rank;
      if (!validator || !myRank) {
        return false;
      }
      if (r.state === "cancel" || r.type === "speciaux") {
        return false;
      }
      if (tab === "pending") {
        if (myRank === 1) return r.state === "pending" && validator.validated === false;
        return r.validators.find((v) => v.rank === myRank - 1)?.validated === true && validator.validated === false && r.state === "pending";

      }
      if (tab === "processed") {
        if (validator.validated === true) {
          return true;
        }
        else {
          return false;
        }
      }
      if (myRank === 1) {
        return true;
      }
      if (r.state === "validated" || r.state === "rejected" || r.state === "store") {
        return true;
      }
      return r.validators.find((v) => v.rank === myRank - 1)?.validated === true;

    });
    return res;
  };

  getMine = async (id: number) => {
    const requests = await prisma.requestModel.findMany({
      where: {
        userId: id,
      },
      include: {
        beficiaryList: {
          omit: {
            password: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            phone: true,
            verificationOtp: true,
          },
        },
        requestOlds: true,
        validators: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests;
  };

  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "COMMANDREQUEST");
    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    const request = await prisma.requestModel.delete({
      where: { id },
    });

    getIO().emit("request:delete");
    return request;
  };

  validate = async (id: number, userId: number, dueDate?: Date, amount?: number | null, priority?: string, quantity?: number, unit?: string, benFac?: string, paytype?: RequestPayType) => {
    const requestModel = await prisma.requestModel.findFirstOrThrow({
      where: { id },
    });

    await CacheService.del(`payment:all`);

    if (requestModel) {
      await prisma.payment.updateMany({
        where: {
          requestId: id,
        },
        data: {
          status: ["ressource_humaine", "facilitation"].includes(
            requestModel.type,
          )
            ? "accepted"
            : ["appro", "settle"].includes(requestModel.type)
              ? "validated"
              : "pending",
        },
      });
    }

    await prisma.requestOld.create({
      data: {
        unit: unit ? requestModel?.unit : null,
        quantity: quantity ? requestModel?.quantity : null,
        priority: priority ? requestModel?.priority : null,
        amount: amount ? requestModel?.amount : null,
        dueDate: dueDate ? requestModel?.dueDate : null,
        request: {
          connect: { id: id },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        state: "validated",
        ...(dueDate && { dueDate: dueDate }),
        ...(amount && { amount: amount }),
        ...(priority && { priority: priority }),
        ...(quantity && { quantity: quantity }),
        ...(unit && { unit: unit }),
        ...(benFac && { benFac: benFac }),
        ...(paytype && { paytype: paytype }),
        validators: {
          updateMany: {
            where: { userId: userId },
            data: { validated: true, decision: "validated" },
          },
        },
      },
    });



    if (["transport", "taxes", "gas", "others"].includes(request.type)) {
      const paytype = await prisma.payType.findFirstOrThrow({
        where: {
          type: request.paytype ?? "cash",
        },
      });

      if (["taxes", "settle"].includes(request.type)) {
        await prisma.payment.updateMany({
          where: {
            requestId: request.id,
          },
          data: {
            status: "validated",
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            type: request.type,
            title: request.label,
            description: request.description || "",
            deadline: request.dueDate,
            price: request.amount || 0,
            status: "validated",
            reference: `PAY-${Date.now()}`,
            methodId: paytype.id,
            requestId: request.id,
          },
        });
      }
    }

    if (["facilitation"].includes(request.type)) {

      const paytype = await prisma.payType.findFirstOrThrow({
        where: {
          type: request.paytype ?? "cash",
        },
      });

      console.log("updating", paytype.id, paytype)
      await prisma.payment.updateMany({
        where: {
          requestId: request.id,
        },
        data: {
          methodId: paytype.id,
        },
      });
    }

    try {
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: "Besoin Valider",
          message: "Votre besoin a ete valider",
          group: request.beneficiary.length > 1,
        },
      });
    } catch (e) {
      console.error(`Could not create notification ${e}`);
    }

    // find manager Id
    const manager = await prisma.role.findFirst({
      where: {
        label: "MANAGER",
      },
    });
    if (!manager) throw Error("MANAGER Role not created");

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        validators: {
          every: {
            categoryId: {
              equals: null,
            },
          },
        },
        validatorOn: {
          none: {
            validated: false,
          },
        },
      },
    });
    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: {
            disconnect: {
              id: manager.id,
            },
          },
        },
      });

      getIO().emit("user:update", { userId });
    }
    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);

    getIO().emit("request:update");
    return request;
  };

  validateBulk = async (ids: number[], validatorId: number, userId: number) => {
    const requestModel = await prisma.requestModel.findFirst({
      where: {
        categoryId: 0,
        id: {
          in: ids,
        },
      },
    });

    await CacheService.del(`payment:all`);

    if (requestModel) {
      await prisma.payment.updateMany({
        where: {
          requestId: {
            in: ids,
          },
        },
        data: {
          status: "pending",
        },
      });
    }
    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);

    const bulk = await Promise.all(
      ids.map(async (id) => {
        const request = await prisma.requestModel.update({
          where: { id },
          data: {
            state: "validated",
            validators: {
              updateMany: {
                where: { userId: userId },
                data: { validated: true, decision: "validated" },
              },
            },
          },
        });
        this.createNotification(request);
        return request;
      }),
    );

    // find manager Id
    const manager = await prisma.role.findFirst({
      where: {
        label: "MANAGER",
      },
    });
    if (!manager) throw Error("MANAGER Role not created");

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        validators: {
          every: {
            categoryId: {
              equals: null,
            },
          },
        },
        validatorOn: {
          none: {
            validated: false,
          },
        },
      },
    });
    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: {
            disconnect: {
              id: manager.id,
            },
          },
        },
      });
      getIO().emit("user:update", { userId });
    }
    getIO().emit("request:update");
    return bulk;
  };

  review = async (
    id: number,
    data: { userId: number; validated: boolean; decision?: string },
    userIdV: number,
  ) => {
    // find manager Id
    const manager = await prisma.role.findFirst({
      where: {
        label: "MANAGER",
      },
    });
    if (!manager) throw Error("MANAGER Role not created");

    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        state: data.validated ? "pending" : "rejected",
        validators: {
          updateMany: {
            where: { userId: userIdV },
            data: {
              validated: true,
              decision: data.validated
                ? "pending"
                : "rejected",
              comment: data.decision ?? '',
            },
          },
        },
      },
    });

    const user = await prisma.user.findFirst({
      where: {
        id: userIdV,
        validators: {
          every: {
            categoryId: {
              equals: null,
            },
          },
        },
        validatorOn: {
          none: {
            validated: false,
          },
        },
      },
    });
    if (user) {
      await prisma.user.update({
        where: { id: userIdV },
        data: {
          role: {
            disconnect: {
              id: manager.id,
            },
          },
        },
      });
      getIO().emit("user:update", { userId: userIdV, action: "data" });
    }
    if (!data.validated) {
      try {
        this.createNotification(request);
      } catch (e) {
        console.error(`Could not create notification ${e}`);
      }
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    getIO().emit("request:update");
    return request;
  };

  reviewBulk = async (
    ids: number[],
    data: { validatorId: number; validated: boolean; decision?: string },
    userId: number,
  ) => {
    const request = await Promise.all(
      ids.map(async (id) => {
        const request = await prisma.requestModel.update({
          where: { id },
          data: {
            state: data.validated ? "pending" : "rejected",
            validators: {
              updateMany: {
                where: { userId: userId },
                data: {
                  validated: true,
                  decision: data.validated ? "pending" : "rejected",
                },
              },
            },
          },
        });

        if (!data.validated) {
          this.createNotification(request);
        }

        await CacheService.del(`${this.CACHE_KEY}:all`);
        await CacheService.del(`${this.CACHE_KEY}:mine`);
        return request;
      }),
    );
    getIO().emit("request:update");
    return request;
  };

  reject = async (id: number) => {
    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        state: "rejected",
      },
    });

    this.createNotification(request);
    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    getIO().emit("request:update");
    return request;
  };

  priority = async (id: number, priority: string) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        priority: priority,
      },
    });
    getIO().emit("request:update");
    return request;
  };

  // add a submit state
  submit = (id: number) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        state: "submited",
      },
    });
  };

  specialRequest = async (
    data: Omit<
      RequestModel,
      | "driverI"
      | "km"
      | "liters"
      | "vehiclesId"
      | "driverId"
      | "decision"
      | "serviceChiefId"
      | "chiefDecision"
      | "isUsed"
    > & { type: string; proof: string | null },
    file?: Express.Multer.File[] | null,
    benef?: number[],
  ) => {

    const paytype = await prisma.payType.findFirstOrThrow({
      where: {
        type: "cash",
      },
    });

    // create request, command and payment
    const ref = "ref-" + new Date().getTime();
    const { type, proof, ...requestData } = data;

    const validators = await prisma.category
      .findUniqueOrThrow({
        where: {
          id: data.categoryId,
        },
        include: {
          validators: true,
        },
      })
      .then((cat) => cat.validators || []);

    const request = await prisma.requestModel.create({
      data: {
        ...requestData,
        period: requestData.period
          ? JSON.parse(requestData.period as unknown as string)
          : null,
        benFac: requestData.benFac
          ? JSON.parse(requestData.benFac as unknown as string)
          : null,
        ref,
        type: data.type,
        state: [
          "ressource_humaine",
          "facilitation",
          "taxes",
          "settle",
        ].includes(data.type)
          ? "pending"
          : "validated",
        beficiaryList: {
          connect: benef
            ? benef.map((beId) => {
              return { id: beId };
            })
            : [],
        },
        validators: {
          createMany: {
            data: validators.map((vldr) => ({
              userId: vldr.userId,
              rank: vldr.rank,
              validated: false,
            })),
          },
        },
      },
      include: {
        beficiaryList: true,
        validators: true,
      },
    });

    await CacheService.del(`payment:all`);

    const refpay = "PAY-" + new Date().getTime();
    const payment = await prisma.payment.create({
      data: {
        title: request.label,
        reference: refpay,
        requestId: request.id,
        description: request.description ?? "",
        projectId: request.projectId ? Number(request.projectId) : null,
        status:
          data.type == "speciaux"
            ? "validated"
            : ["facilitation", "ressource_humaine", "settle"].includes(
              data.type,
            )
              ? "ghost"
              : "pending",
        type: type,
        methodId: paytype.id,
        priority: "medium",
        price: data.amount!,
        proof: proof,
      },
    });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: request.id.toString(),
        ownerType: "PAYMENT",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    getIO().emit("request:new");
    return { request: request, payment: payment };
  };

  approvisionement = async (
    data: Omit<
      RequestModel,
      | "driverI"
      | "km"
      | "liters"
      | "vehiclesId"
      | "driverId"
      | "decision"
      | "serviceChiefId"
      | "chiefDecision"
      | "isUsed"
    >,
  ) => {
    const { ...requestData } = data;

    const paytype = await prisma.payType.findFirstOrThrow({
      where: {
        type: data.paytype,
      },
    });

    const ref = "ref-" + new Date().getTime();

    const validators = await prisma.category
      .findUniqueOrThrow({
        where: {
          id: data.categoryId,
        },
        include: {
          validators: true,
        },
      })
      .then((cat) => cat.validators || []);

    const request = await prisma.requestModel.create({
      data: {
        ...requestData,
        period: requestData.period
          ? JSON.parse(requestData.period as unknown as string)
          : null,
        benFac: requestData.benFac
          ? JSON.parse(requestData.benFac as unknown as string)
          : null,
        type: data.type,
        ref,
        beneficiary: data.beneficiary ?? "",
        state: ["facilitation", "ressource_humaine", "appro"].includes(
          data.type,
        )
          ? "pending"
          : "validated",
        validators: {
          createMany: {
            data: validators.map((vldr) => ({
              userId: vldr.userId,
              rank: vldr.rank,
              validated: false,
            })),
          },
        },
      },
      include: {
        beficiaryList: true,
        validators: true,
      },
    });

    await CacheService.del(`payment:all`);

    const refpay = "ref-" + new Date().getTime();
    const payment = await prisma.payment.create({
      data: {
        title: request.label,
        reference: refpay,
        requestId: request.id,
        description: request.description ?? "",
        projectId: request.projectId ? Number(request.projectId) : null,
        status: ["speciaux"].includes(data.type)
          ? "validated"
          : ["facilitation", "ressource_humaine", "appro"].includes(data.type)
            ? "ghost"
            : // ? "accepted"
            "pending",
        type: data.type,
        methodId: paytype.id,
        priority: "medium",
        price: data.amount!,
      },
    });

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    getIO().emit("request:new");
    return { request: request, payment: payment };
  };

  specialRequestUpdate = async (
    id: number,
    data: Partial<RequestModel> & { proof?: string | null },
    file?: Express.Multer.File[] | null,
    benef?: number[],
  ) => {
    // create request, command and payment
    const {
      proof,
      type,
      paytype,
      id: nid,
      userId,
      projectId,
      categoryId,
      commandId,
      ...requestData
    } = data;

    let myPaytype: PayType | null = null;

    if (paytype) {
      const paymentTypes = await prisma.payType.findMany();
      myPaytype = paymentTypes.find((x) => x.type === paytype)!;

      await prisma.payment.updateMany({
        where: {
          requestId: id,
        },
        data: {
          methodId: myPaytype.id,
        },
      });
    }

    await CacheService.del(`payment:all`);
    if (requestData.amount || requestData.label || requestData.dueDate) {
      await prisma.payment.updateMany({
        where: {
          requestId: id,
        },
        data: {
          price: requestData.amount!,
          title: requestData.label!,
          deadline: requestData.dueDate!,
          priority: requestData.priority!,
        },
      });
    } else throw Error("Lack information Can not update");

    if (proof) {
      await prisma.payment.updateMany({
        where: {
          requestId: id,
        },
        data: {
          price: requestData.amount!,
          title: requestData.label!,
          deadline: requestData.dueDate!,
          proof: proof,
        },
      });
    }

    const request = await prisma.requestModel.update({
      where: {
        id,
      },
      data: {
        ...requestData,
        period: requestData.period
          ? JSON.parse(requestData.period as unknown as string)
          : null,
        benFac: requestData.benFac
          ? JSON.parse(requestData.benFac as unknown as string)
          : null,
        beficiaryList: {
          set: benef
            ? benef.map((beId) => {
              return { id: beId };
            })
            : [],
        },
      },
      include: {
        beficiaryList: true,
      },
    });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: request.id.toString(),
        ownerType: "COMMANDREQUEST",
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    getIO().emit("request:update");
    return request;
  };

  specialGet = async () => {
    return await prisma.requestModel.findMany({
      where: { categoryId: 0 },
    });
  };

  // create notification

  createNotification = async (request: RequestModel) => {
    try {
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: `Besoin ${request.state}`,
          message: `Votre besoin a ete ${request.state}`,
          group: request.beneficiary.length > 1,
        },
      });
    } catch (e) {
      console.error(`Could not create notification ${e}`);
    }
  };
}
