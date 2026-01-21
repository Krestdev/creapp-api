import { PrismaClient, RequestModel } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class RequestService {
  CACHE_KEY = "request";

  create = async (
    data: Omit<RequestModel, "createdAt" | "updatedAt">,
    benList?: number[],
  ) => {
    const ref = "ref-" + new Date().getTime();

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
      },
    });
    getIO().emit("request:new", { userId: request.userId });
    return request;
  };

  update = async (
    id: number,
    data: Partial<Omit<RequestModel, "createdAt" | "updatedAt">>,
    benList?: number[],
  ) => {
    const updateData: any = {};
    const { label, description, ...ndata } = data;
    if (data.label !== undefined) updateData.label = label;
    if (data.description !== undefined) updateData.description = description;

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);
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

    getIO().emit("request:update");
    return request;
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
        revieweeList: true,
      },
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, requests, 90);

    return requests;
  };

  getOne = (id: number) => {
    return prisma.requestModel.findUnique({
      where: { id },
      include: {
        revieweeList: true,
      },
    });
  };

  getMine = async (id: number) => {
    const requests = await prisma.requestModel.findMany({
      where: {
        userId: id,
      },
      include: {
        revieweeList: true,
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

  validate = async (id: number, validatorId: number) => {
    const requestModel = await prisma.requestModel.findFirst({
      where: { categoryId: 0, id: id },
    });

    if (requestModel) {
      await prisma.payment.updateMany({
        where: {
          requestId: id,
        },
        data: {
          status:
            requestModel.type === "FACILITATION".toLowerCase()
              ? "accepted"
              : "pending",
        },
      });
    }

    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        state: "validated",
        revieweeList: {
          create: {
            decision: "validated",
            validatorId: validatorId,
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

    await CacheService.del(`${this.CACHE_KEY}:all`);
    await CacheService.del(`${this.CACHE_KEY}:mine`);

    getIO().emit("request:update");
    return request;
  };

  validateBulk = async (ids: number[], validatorId: number) => {
    const requestModel = await prisma.requestModel.findFirst({
      where: {
        categoryId: 0,
        id: {
          in: ids,
        },
      },
    });

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
            revieweeList: {
              create: {
                decision: "validated",
                validatorId: validatorId,
              },
            },
          },
        });
        this.createNotification(request);
        return request;
      }),
    );

    getIO().emit("request:update");
    return bulk;
  };

  review = async (
    id: number,
    data: { userId: number; validated: boolean; decision?: string },
  ) => {
    const request = await prisma.requestModel.update({
      where: { id },
      data: {
        state: data.validated ? "pending" : "rejected",
      },
    });

    const review = prisma.requestValidation.create({
      data: {
        validatorId: data.userId,
        decision: data.validated ? "validated" : `rejected ${data.decision}`,
        requestId: id,
      },
    });

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
    return review;
  };

  reviewBulk = async (
    ids: number[],
    data: { validatorId: number; validated: boolean; decision?: string },
  ) => {
    const request = await Promise.all(
      ids.map(async (id) => {
        const request = await prisma.requestModel.update({
          where: { id },
          data: {
            state: data.validated ? "pending" : "rejected",
          },
        });
        const review = await prisma.requestValidation.create({
          data: {
            validatorId: data.validatorId,
            decision: data.validated
              ? "validated"
              : `rejected ${data.decision}`,
            requestId: id,
          },
        });

        if (!data.validated) {
          this.createNotification(request);
        }

        await CacheService.del(`${this.CACHE_KEY}:all`);
        await CacheService.del(`${this.CACHE_KEY}:mine`);
        return review;
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
          data.type == "FACILITATION".toLowerCase() ? "pending" : "validated",
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
            : data.type == "FACILITATION".toLowerCase()
              ? "ghost"
              : data.type == "ressource_humaine"
                ? "accepted"
                : "pending",
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
