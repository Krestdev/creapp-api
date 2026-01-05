import { Reception, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReceptionService {
  // Create
  create = (data: Reception) => {
    return prisma.reception.create({
      data,
    });
  };

  // Update
  update = async (
    id: number,
    data: Reception & {
      Deliverables: { id: number; isDelivered: boolean }[];
    }
  ) => {
    if (data.ReceiptDate) {
      data.ReceiptDate = new Date(data.ReceiptDate);
    }
    if (data.Deadline) {
      data;
    }
    if (data.ProviderId) {
      data.ProviderId = Number(data.ProviderId);
    }
    if (data.CommandId) {
      data.CommandId = Number(data.CommandId);
    }
    if (data.Deadline) {
      data.Deadline = new Date(data.Deadline);
    }

    const prevReception = await prisma.reception.findFirstOrThrow({
      where: { id },
    });

    const { Deliverables, ...dataRest } = data;

    await Promise.all(
      Deliverables.map(async (deliv) => {
        await prisma.deviElement
          .updateMany({
            where: {
              id: deliv.id,
            },
            data: {
              isDelivered: deliv.isDelivered,
            },
          })
          .catch((e) => {
            console.log("1", e);
            throw e;
          });
      })
    );

    await prisma.reception
      .update({
        where: {
          id,
          Deliverables: {
            some: {
              isDelivered: true,
            },
          },
        },
        data: {
          Status: "PARTIAL",
        },
      })
      .catch((e) => {
        console.log("2", e);
        throw e;
      });

    await prisma.reception
      .updateMany({
        where: {
          id,
          Deliverables: {
            every: {
              isDelivered: true,
            },
          },
        },
        data: {
          Status: "COMPLETED",
        },
      })
      .catch((e) => {
        console.log("3", e);
        throw e;
      });

    return prisma.reception.update({
      where: { id },
      data: {
        ...dataRest,
        Proof: data.Proof
          ? `${prevReception.Proof};${data.Proof}`
          : prevReception.Proof,
      },
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.reception.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.reception.findMany({
      include: {
        Command: true,
        Provider: true,
        Deliverables: true,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.reception.findUniqueOrThrow({
      where: { id },
    });
  };
}
