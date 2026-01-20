import { CommandRequest, PrismaClient } from "@prisma/client";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class CommandRequestService {
  CACHE_KEY = "commandRequest";
  // Create
  create = async (data: CommandRequest, requests: number[]) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const ref = "ref-" + new Date().getTime();
    const commandRequest = await prisma.commandRequest.create({
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
    getIO().emit("command:new");
    return commandRequest;
  };

  // Update
  update = async (id: number, data: CommandRequest, requests: number[]) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const commandRequest = await prisma.commandRequest.update({
      where: { id },
      data: {
        ...data,
        besoins: {
          set: requests.map((reqId) => ({ id: reqId })),
        },
      },
    });
    getIO().emit("command:update");
    return commandRequest;
  };

  // Delete
  delete = async (id: number) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const commandRequest = await prisma.commandRequest.delete({
      where: { id },
    });
    getIO().emit("command:delete");
    return commandRequest;
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<CommandRequest[]>(
      `${this.CACHE_KEY}:all`,
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
