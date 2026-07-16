import { modification, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ModificationService {
  // Create
  create = (data: modification) => {
    return prisma.modification.create({
      data: {
        ...data,
        changes: data.changes as Prisma.InputJsonValue,
      },
    });
  };

  // Update
  update = (id: number, data: modification) => {
    return prisma.modification.update({
      where: { id },
      data: {
        ...data,
        changes: data.changes as Prisma.InputJsonValue,
      },
    });
  };

  validate = async (id: number, decision: boolean) => {
    const modification = await prisma.modification.update({
      where: { id },
      data: {
        status: decision ? "APPROVED" : "REJECTED",
        decision: decision,
      },
    });

    const data = JSON.parse(JSON.stringify(modification.changes))

    if (modification.requestId) {
      await prisma.requestModel.update({
        where: { id: modification.requestId },
        data: {
          ...data
        },
      })
    } else if (modification.paymentId) {
      await prisma.payment.update({
        where: { id: modification.paymentId },
        data: {
          ...data
        },
      })
    } else if (modification.transactionId) {
      await prisma.transaction.update({
        where: { id: modification.transactionId },
        data: {
          ...data
        },
      })
    } else if (modification.devisId) {
      await prisma.devi.update({
        where: { id: modification.devisId },
        data: {
          ...data
        },
      })
    } else if (modification.commandId) {
      await prisma.command.update({
        where: { id: modification.commandId },
        data: {
          ...data
        },
      })
    }

    return modification
  }

  // Delete
  delete = (id: number) => {
    return prisma.modification.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.modification.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.modification.findUniqueOrThrow({
      where: { id },
    });
  };
}
