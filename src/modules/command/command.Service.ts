import { Command, PrismaClient } from "@prisma/client";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";

const prisma = new PrismaClient();

export class CommandService {
  CACHE_KEY = "command";
  // Create
  create = async (
    data: Command & {
      instalments: {
        percentage: number;
        deadLine?: string;
        status?: boolean;
      }[];
    },
    requestIds: number[],
  ) => {
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

    await CacheService.del(`${this.CACHE_KEY}:all`);
    const devi = await prisma.devi.findUnique({
      where: { id: data.deviId },
      include: {
        element: true,
      },
    });

    const isReel = provider.regem === "Réel";
    const amountHt =
      devi?.element?.reduce((acc, req) => acc + (req.priceProposed || 0), 0) ||
      0;

    const netCommercial =
      amountHt -
      (data.rabaisAmount || 0) * amountHt -
      (data.remiseAmount || 0) * amountHt -
      (data.remiseAmount || 0) * amountHt;

    if (isReel) {
      // TVA + IR + IS
      data.netToPay =
        netCommercial < 0
          ? 0
          : netCommercial * (1 + 0.1925 + 0.05 + 0.022 + 0.02);
    } else {
      data.netToPay = netCommercial < 0 ? 0 : netCommercial;
    }

    const command = await prisma.command.create({
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
        instalments: {
          create: data.instalments.map((inst) => {
            return {
              ...inst,
            };
          }),
        },
      },
    });

    getIO().emit("purchaseOrder:new");
    return command;
  };

  // Update
  update = async (id: number, data: Command) => {
    if (data.providerId !== null && data.providerId !== undefined) {
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

      if (data.deviId == null) throw Error("Devi is required");
      await CacheService.del(`${this.CACHE_KEY}:all`);
      const devi = await prisma.devi.findUnique({
        where: { id: data.deviId },
        include: {
          element: true,
        },
      });

      const isReel = provider.regem === "Réel";
      const amountHt =
        devi?.element?.reduce(
          (acc, req) => acc + (req.priceProposed || 0),
          0,
        ) || 0;

      const netCommercial =
        amountHt -
        (data.rabaisAmount || 0) * amountHt -
        (data.remiseAmount || 0) * amountHt -
        (data.remiseAmount || 0) * amountHt;

      if (isReel) {
        // TVA + IR + IS
        data.netToPay =
          netCommercial < 0
            ? 0
            : netCommercial * (1 + 0.1925 + 0.05 + 0.022 + 0.02);
      } else {
        data.netToPay = netCommercial < 0 ? 0 : netCommercial;
      }
    }

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
              ? command.devi.element
                  .filter((el) => el.status === "SELECTED")
                  .map((el) => ({ id: el.id }))
              : [],
          },
          Proof: "",
          CommandId: command.id,
          ProviderId: command.providerId,
          userId: command.devi ? command.devi.userId : null,
          Deadline: new Date(),
        },
      });
    }

    await CacheService.del(`${this.CACHE_KEY}:all`);
    getIO().emit("purchaseOrder:update");
    return command;
  };

  // Delete
  delete = async (id: number) => {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const command = await prisma.command.delete({
      where: { id },
    });
    getIO().emit("purchaseOrder:delete");
    return command;
  };

  // Get all
  getAll = async () => {
    const cached = await CacheService.get<Command[]>(`${this.CACHE_KEY}:all`);
    if (cached) return cached;

    const command = await prisma.command.findMany({
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

    await CacheService.set(`${this.CACHE_KEY}:all`, command, 90);
    return command;
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
