import { Reception, PrismaClient } from "@prisma/client";
import {
  deleteDocumentsByOwner,
  storeDocumentsBulk,
} from "../../utils/DocumentManager";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class ReceptionService {
  // Create
  create = async (data: Reception) => {
    const reception = await prisma.reception.create({
      data,
    });
    getIO().emit("reception:new");
    return reception;
  };

  // Update
  update = async (
    id: number,
    data: Reception & {
      Deliverables: { id: number; isDelivered: boolean }[];
    },
    file: Express.Multer.File[] | null,
  ) => {
    if (data.ReceiptDate) {
      data.ReceiptDate = new Date(data.ReceiptDate);
    }
    if (data.Deadline) {
      data.Deadline = new Date(data.Deadline);
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
        await prisma.deviElement.updateMany({
          where: {
            id: deliv.id,
          },
          data: {
            isDelivered: deliv.isDelivered,
          },
        });
      }),
    );

    await prisma.reception.update({
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
    });

    await prisma.reception.updateMany({
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
    });

    const reception = await prisma.reception.update({
      where: { id },
      data: {
        ...dataRest,
        Proof: data.Proof
          ? `${prevReception.Proof};${data.Proof}`
          : prevReception.Proof,
      },
    });

    if (file) {
      await storeDocumentsBulk(file, {
        role: "PROOF",
        ownerId: reception.id.toString(),
        ownerType: "RECEPTION",
      });
    }
    getIO().emit("reception:update");
    return reception;
  };

  // Delete
  delete = async (id: number) => {
    deleteDocumentsByOwner(id.toString(), "RECEPTION");
    const reception = await prisma.reception.delete({
      where: { id },
    });
    getIO().emit("reception:delete");
    return reception;
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
