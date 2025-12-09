import { CommandRequest, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CommandRequestService {
  // Create
  create = (data: CommandRequest, requests: number[]) => {
    const ref = "ref-" + new Date().getTime();
    return prisma.commandRequest.create({
      data: {
        ...data,
        reference: ref,
        besoins: {
          connect: requests.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // Update
  update = async (id: number, data: CommandRequest, requests: number[]) => {
    return prisma.commandRequest.update({
      where: { id },
      data: {
        ...data,
        besoins: {
          set: requests.map((reqId) => ({ id: reqId })),
        },
      },
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.commandRequest.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.commandRequest.findMany({
      include: {
        besoins: true,
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.commandRequest.findUniqueOrThrow({
      where: { id },
    });
  };

  // Link-Provider
  linkProvider = (id: number, providerId: number) => {
    return prisma.commandRequest.update({
      where: { id },
      data: {
        provider: {
          connect: { id: providerId },
        },
      },
    });
  };

  // Attach-Doc
  attachDoc = (id: number, documentId: number) => {
    return prisma.commandRequest.update({
      where: { id },
      data: {
        documents: {
          connect: { id: documentId },
        },
      },
    });
  };
}
