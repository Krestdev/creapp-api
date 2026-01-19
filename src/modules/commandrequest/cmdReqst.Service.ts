import { CommandRequest, PrismaClient } from "@prisma/client";
import { CacheService } from "../../utils/redis";

const prisma = new PrismaClient();

export class CommandRequestService {
  CACHE_KEY = "commandRequest";
  // Create
  create = async (data: CommandRequest, requests: number[]) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
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
    await CacheService.del(`${this.CACHE_KEY}:all`);
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
  delete = async (id: number) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    return prisma.commandRequest.delete({
      where: { id },
    });
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<CommandRequest[]>(
      `${this.CACHE_KEY}:all`
    );
    if (cached) return cached;

    const commandRqst = await prisma.commandRequest.findMany({
      include: {
        besoins: true,
      },
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, commandRqst, 90);
    return commandRqst;
  };

  // Get one
  getOne = (id: number) => {
    return prisma.commandRequest.findUniqueOrThrow({
      where: { id },
    });
  };
}
