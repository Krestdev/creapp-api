import { PrismaClient, RequestModel } from "@prisma/client";

const prisma = new PrismaClient();

export class RequestService {
  create = (
    data: Omit<RequestModel, "createdAt" | "updatedAt">,
    benList?: number[]
  ) => {
    const ref = "ref-" + new Date().getTime();
    return prisma.requestModel.create({
      data: {
        ...data,
        period: data.period
          ? JSON.parse(data.period as unknown as string)
          : null,
        benFac: data.benFac
          ? JSON.parse(data.benFac as unknown as string)
          : null,
        ref,
        type: "PURCHASE",
        beficiaryList: {
          connect: benList
            ? benList.map((beId) => {
                return { id: beId };
              })
            : [],
        },
      },
    });
  };

  update = (
    id: number,
    data: Partial<Omit<RequestModel, "createdAt" | "updatedAt">>,
    benList?: number[]
  ) => {
    const updateData: any = {};
    const { label, description, ...ndata } = data;
    if (data.label !== undefined) updateData.label = label;
    if (data.description !== undefined) updateData.description = description;

    return prisma.requestModel.update({
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
  };

  getAll = () => {
    return prisma.requestModel.findMany({
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
  };

  getOne = (id: number) => {
    return prisma.requestModel.findUnique({
      where: { id },
      include: {
        revieweeList: true,
      },
    });
  };

  getMine = (id: number) => {
    return prisma.requestModel.findMany({
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
  };

  delete = (id: number) => {
    return prisma.requestModel.delete({
      where: { id },
    });
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
          status: "pending",
        },
      });
    }

    return prisma.requestModel.update({
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

    return Promise.all(
      ids.map(async (id) => {
        return await prisma.requestModel.update({
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
      })
    );
  };

  review = (
    id: number,
    data: { userId: number; validated: boolean; decision?: string }
  ) => {
    return prisma.requestModel
      .update({
        where: { id },
        data: {
          state: data.validated ? "pending" : "rejected",
        },
      })
      .then(() => {
        return prisma.requestValidation.create({
          data: {
            validatorId: data.userId,
            decision: data.validated
              ? "validated"
              : `rejected ${data.decision}`,
            requestId: id,
          },
        });
      });
  };

  reviewBulk = (
    ids: number[],
    data: { validatorId: number; validated: boolean; decision?: string }
  ) => {
    return Promise.all(
      ids.map(async (id) => {
        console.log(id, data);
        return await prisma.requestModel
          .update({
            where: { id },
            data: {
              state: data.validated ? "pending" : "rejected",
            },
          })
          .then(() => {
            return prisma.requestValidation.create({
              data: {
                validatorId: data.validatorId,
                decision: data.validated
                  ? "validated"
                  : `rejected ${data.decision}`,
                requestId: id,
              },
            });
          })
          .catch((e) => {
            console.log(e);
            throw e;
          });
      })
    );
  };

  reject = (id: number) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        state: "rejected",
      },
    });
  };

  priority = (id: number, priority: string) => {
    return prisma.requestModel.update({
      where: { id },
      data: {
        priority: priority,
      },
    });
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
    benef?: number[]
  ) => {
    // create request, command and payment
    const ref = "ref-" + new Date().getTime();
    const { type, proof, ...requestData } = data;

    const request = await prisma.requestModel
      .create({
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
          state: data.type == "FAC" ? "pending" : "validated",
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
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });

    const refpay = "ref-" + new Date().getTime();
    const payment = await prisma.payment.create({
      data: {
        title: request.label,
        reference: refpay,
        requestId: request.id,
        status:
          data.type == "SPECIAL"
            ? "validated"
            : data.type == "FAC"
            ? "ghost"
            : "pending",
        type: type,
        priority: "medium",
        price: data.amount!,
        proof: proof,
      },
    });

    return { request: request, payment: payment };
  };

  specialRequestUpdate = async (
    id: number,
    data: Partial<RequestModel> & { type: string; proof: string | null },
    benef?: number[]
  ) => {
    // create request, command and payment
    const { type, proof, ...requestData } = data;

    await prisma.payment.updateMany({
      where: {
        requestId: id,
        proof: {
          not: proof,
        },
      },
      data: {
        proof: proof,
      },
    });

    const request = await prisma.requestModel
      .update({
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
      })
      .catch((e) => {
        console.log(e);
        throw e;
      });

    return request;
  };

  specialGet = async () => {
    return await prisma.requestModel.findMany({
      where: { categoryId: 0 },
    });
  };
}
