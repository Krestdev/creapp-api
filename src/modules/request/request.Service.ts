import { PrismaClient, RequestModel } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";
import { log } from "console";

const prisma = new PrismaClient();

export class RequestService {
  CACHE_KEY = "request";

  create = async (
    data: Omit<RequestModel, "createdAt" | "updatedAt">,
    benList?: number[],
  ) => {
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

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
    const request = await prisma.requestModel.create({
      data: {
        ...data,
        period: data.period
          ? JSON.parse(data.period as unknown as string)
          : null,
        benFac: data.benFac
          ? JSON.parse(data.benFac as unknown as string)
          : null,
        ref,
        type: "ACHAT".toLowerCase(),
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

    const requestOld = await prisma.requestOld.create({
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

    console.log(requestOld);

    getIO().emit("request:update");
    return prisma.requestModel.findUnique({
      where: { id: request.id },
      include: { requestOlds: true },
    });
  };

  getAll = async () => {
    const cached = await CacheService.get<RequestModel[]>(
      `${this.CACHE_KEY}:all`,
    );
    if (cached) return cached;

    const requests = await prisma.requestModel.findMany({
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
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, requests, 90);

    return requests;
  };

  getOne = (id: number) => {
    return prisma.requestModel.findUnique({
      where: { id },
    });
  };

  getMyValidator = async (id: number) => {
    const requests = await prisma.requestModel.findMany({
      where: {
        validators: {
          some: {
            userId: {
              equals: id,
            },
          },
        },
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
    });

    return requests;
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

  validate = async (id: number, validatorId: number, userId: number) => {
    const requestModel = await prisma.requestModel.findFirst({
      where: { categoryId: 0, id: id },
    });

    await CacheService.del(`payment:all`);

    if (requestModel) {
      await prisma.payment.updateMany({
        where: {
          requestId: id,
        },
        data: {
          status:
            requestModel.type === "FACILITATION".toLowerCase() ||
            requestModel.type === "ressource_humaine"
              ? "accepted"
              : "pending",
        },
      });
    }

    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        state: "validated",
        validators: {
          updateMany: {
            where: { userId: validatorId },
            data: { validated: true, decision: "validated" },
          },
        },
      },
    });

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

    const user = await prisma.user.findUnique({
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
      log("User found:", user);
      return await prisma.user.update({
        where: { id: user.id },
        data: {
          role: {
            disconnect: {
              id: manager.id,
            },
          },
        },
      });
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

    const user = await prisma.user.findUnique({
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
        where: { id: user.id },
        data: {
          role: {
            disconnect: {
              id: manager.id,
            },
          },
        },
      });
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
              decision: data.validated ? "pending" : "rejected",
            },
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
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
      console.log("user found:", user);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: {
            disconnect: {
              id: manager.id,
            },
          },
        },
      });
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
    data: RequestModel & { type: string; proof: string | null },
    file?: Express.Multer.File[] | null,
    benef?: number[],
  ) => {
    // create request, command and payment
    const ref = "ref-" + new Date().getTime();
    const { type, proof, ...requestData } = data;

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
        state:
          data.type == "FACILITATION" || data.type == "ressource_humaine"
            ? "pending"
            : "validated",
        beficiaryList: {
          connect: benef
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

    await CacheService.del(`payment:all`);

    const refpay = "ref-" + new Date().getTime();
    const payment = await prisma.payment.create({
      data: {
        title: request.label,
        reference: refpay,
        requestId: request.id,
        description: request.description ?? "",
        projectId: request.projectId ? Number(request.projectId) : null,
        status:
          data.type == "SPECIAUX".toLowerCase()
            ? "validated"
            : data.type == "FACILITATION".toLowerCase() ||
                data.type == "ressource_humaine"
              ? "ghost"
              : // ? "accepted"
                "pending",
        type: type,
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

  specialRequestUpdate = async (
    id: number,
    data: Partial<RequestModel> & { proof?: string | null },
    file?: Express.Multer.File[] | null,
    benef?: number[],
  ) => {
    // create request, command and payment
    const { proof, ...requestData } = data;

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
