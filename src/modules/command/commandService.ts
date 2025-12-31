import { Command, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CommandService {
  // Create
  create = async (data: Command, requestIds: number[]) => {
    if (data.providerId == null) throw Error("A provider is required");
    const provider = await prisma.provider.findFirst({
      where: {
        id: data.providerId,
      },
    });

    if (provider == null) throw Error("provider does not exist");
    const providerNotComplete = Object.entries(provider).some(([, value]) => {
      return value === null || value === "";
    });

    if (providerNotComplete) throw Error("The Provider info is not Complete");
    const ref = "ref-" + new Date().getTime();

    if (data.deviId == null) throw Error("Devi is required");

    return prisma.command.create({
      data: {
        ...data,
        reference: ref,
        requests: {
          connect: requestIds.map((id) => {
            return { id };
          }),
        },
        devi: {
          connect: {
            id: data.deviId,
          },
        },
      },
    });
  };

  // Update
  update = async (id: number, data: Command) => {
    const command = await prisma.command.update({
      where: { id },
      data,
      include: {
        devi: {
          include: {
            element: true,
          },
        },
      },
    });

    if (data.status === "APPROVED") {
      await prisma.reception.create({
        data: {
          Reference: "ref-" + new Date().getTime(),
          Status: "PENDING",
          Deliverables: {
            connect: command.devi
              ? command.devi.element.map((el) => ({ id: el.id }))
              : [],
          },
          Proof: "",
          ProviderId: command.providerId,
          userId: command.devi ? command.devi.userId : null,
          Deadline: new Date(),
        },
      });
    }

    return command;
  };

  // Delete
  delete = (id: number) => {
    return prisma.command.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.command.findMany({
      include: {
        devi: {
          include: {
            commandRequest: {
              include: {
                besoins: {
                  include: {
                    project: true,
                  },
                },
              },
            },
            element: true,
          },
        },
        provider: true,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.command.findUniqueOrThrow({
      where: { id },
      include: {
        devi: {
          include: {
            commandRequest: true,
            element: true,
          },
        },
        provider: true,
      },
    });
  };
}
