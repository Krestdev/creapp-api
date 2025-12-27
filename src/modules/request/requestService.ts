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
        ref,
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

  validate = (id: number, validatorId: number) => {
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
          ref,
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
        title: "",
        reference: refpay,
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

  specialGet = async () => {
    return await prisma.requestModel.findMany({
      where: { categoryId: 0 },
    });
  };
}
