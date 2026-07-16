import { Devi, DeviElement, PrismaClient } from "@prisma/client";
import { getIO } from "../../socket";
import { storeDocumentsBulk } from "../../utils/DocumentManager";

const prisma = new PrismaClient();

export class DeviService {
  // Create

  create = async (data: Devi, elements: DeviElement[]) => {
    const ref = "ref-" + new Date().getTime();
    // | "SUBMITTED" Soumis, en attente d’analyse / comparaison
    // | "APPROVED" Toutes les lignes du devis sont retenues
    // | "REJECTED" Aucune ligne retenue
    // | "PENDING";
    const devi = await prisma.devi.create({
      data: {
        ...data,
        ref,
        element: {
          create: elements,
        },
      },
      include: {
        element: true,
        commandRequest: {
          include: {
            besoins: true,
          },
        },
      },
    });

    getIO().emit("quotation:new");
    return devi;
  };

  // Update
  update = async (
    id: number,
    data: Partial<Devi>,
    elements: DeviElement[],
    file: Express.Multer.File[] | null,
  ) => {
    const existing = elements.filter((e) => !!e.id);
    const toCreate = elements.filter((e) => !e.id);
    const existingIds = existing.map((e) => e.id);

    // | "SELECTED"         // Ligne retenue par le DO pour passer en BC
    // | "NOT_SELECTED"     // Ligne explicitement non retenue

    if (file) {
      await storeDocumentsBulk(file, {
        role: "JUSTIFICATION",
        ownerId: id.toString(),
        ownerType: "BANK",
      });
    }

    const devi = await prisma.devi.update({
      where: { id },
      data: {
        ...data,
        element: {
          deleteMany: {
            deviId: id,
            id: { notIn: existingIds },
          },
          updateMany: existing.map((e) => ({
            where: { id: e.id },
            data: {
              requestModelId: e.requestModelId,
              quantity: e.quantity,
              unit: e.unit,
              title: e.title,
              priceProposed: e.priceProposed,
            },
          })),
          create: toCreate.map((e) => ({
            requestModelId: e.requestModelId,
            quantity: e.quantity,
            unit: e.unit,
            title: e.title,
            priceProposed: e.priceProposed,
          })),
        },
      },
    });

    getIO().emit("quotation:update");
    return devi;
  };

  validateDevi = async (
    data: {
      deviId: number;
      userId: number;
      commandRequestId: number;
      elements: {
        name: string;
        elementIds: number[];
      }[];
    }[],
  ) => {
    const elements = data.map((el) => el.elements).flat();
    const DelementIds = elements.map((el) => el.elementIds).flat();

    if (DelementIds.length === 0) {
      return { count: 0 };
    }

    // 1. Find all requestModelId values associated with the currently selected elements
    const selectedElements = await prisma.deviElement.findMany({
      where: {
        id: { in: DelementIds },
      },
      select: {
        requestModelId: true,
      },
    });

    const requestModelIds = selectedElements
      .map((el) => el.requestModelId)
      .filter((id): id is number => id !== null);

    // 2. Find all Devi IDs that contain elements for the command requests of the submitted devis
    const commandRequestIds = data
      .map((d) => d.commandRequestId)
      .filter((id): id is number => id !== null && id !== undefined);

    const devisToUpdate = await prisma.devi.findMany({
      where: {
        commandRequestId: { in: commandRequestIds },
      },
      select: {
        id: true,
      },
    });

    const submittedDeviIds = data.map((d) => d.deviId);
    const affectedDeviIds = Array.from(
      new Set([...submittedDeviIds, ...devisToUpdate.map((d) => d.id)]),
    );

    // 3. Perform updates inside a transaction for consistency
    return prisma.$transaction(async (tx) => {
      // Mark submitted elements as SELECTED
      await tx.deviElement.updateMany({
        where: {
          id: { in: DelementIds },
        },
        data: { status: "SELECTED" },
      });

      // Mark other elements for the same requests as REJECTED
      await tx.deviElement.updateMany({
        where: {
          deviId: { in: affectedDeviIds },
          id: { notIn: DelementIds },
          requestModelId: { in: requestModelIds },
        },
        data: {
          status: "REJECTED",
        },
      });

      // Reset elements whose requests are completely unselected to NOT_SELECTED
      await tx.deviElement.updateMany({
        where: {
          deviId: { in: affectedDeviIds },
          id: { notIn: DelementIds },
          requestModelId: {
            notIn: requestModelIds,
            not: null,
          },
        },
        data: {
          status: "NOT_SELECTED",
        },
      });

      // Reset affected Devis status to PENDING
      await tx.devi.updateMany({
        where: {
          id: { in: affectedDeviIds },
        },
        data: {
          status: "PENDING",
        },
      });

      // Rule 2: A Devi is rejected only when all its elements are REJECTED
      await tx.devi.updateMany({
        where: {
          id: { in: affectedDeviIds },
          element: {
            every: {
              status: "REJECTED",
            },
          },
        },
        data: {
          status: "REJECTED",
        },
      });

      // Rule 1 & 3: A Devi is approved only when:
      // - At least one of its elements is SELECTED (some: SELECTED)
      // - None of its elements are NOT_SELECTED (none: NOT_SELECTED)
      // If there is still at least one request not handled, that element is NOT_SELECTED,
      // which prevents the Devi from matching this clause, keeping it PENDING.
      return tx.devi.updateMany({
        where: {
          id: { in: affectedDeviIds },
          AND: [
            {
              element: {
                none: {
                  status: {
                    equals: "NOT_SELECTED",
                  },
                },
              },
            },
            {
              element: {
                some: {
                  status: {
                    equals: "SELECTED",
                  },
                },
              },
            },
          ],
        },
        data: {
          status: "APPROVED",
        },
      });
    });
  };

  // Update
  updateDeviElement = (id: number, data: DeviElement) => {
    return prisma.deviElement.update({
      where: { id },
      data,
    });
  };

  // Update
  addElement = (id: number, data?: DeviElement[], ids?: number[]) => {
    if (ids)
      return prisma.devi.update({
        where: { id },
        data: {
          element: {
            connect: ids.map((id) => {
              return { id };
            }),
          },
        },
      });
    else if (data)
      return prisma.devi.update({
        where: { id },
        data: {
          element: {
            create: data.map((element) => {
              return { ...element };
            }),
          },
        },
      });
  };

  // Update
  removeElement = (id: number, elementIds: number[]) => {
    return prisma.devi.update({
      where: { id },
      data: {
        element: {
          disconnect: elementIds.map((id) => {
            return { id };
          }),
        },
      },
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.devi.delete({
      where: { id },
    });
  };

  deleteElement = (id: number) => {
    return prisma.deviElement.delete({ where: { id } });
  };

  getAllDeviElement = () => {
    return prisma.deviElement.findMany();
  };

  // Get all
  getAll = () => {
    return prisma.devi.findMany({
      include: {
        element: true,
        commandRequest: {
          include: {
            besoins: true,
            provider: true,
          },
        },
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.devi.findUniqueOrThrow({
      where: { id },
      include: {
        element: {
          include: {
            request: {
              select: {
                id: true,
                label: true,
              },
            },
          },
        },
        commandRequest: {
          include: {
            besoins: true,
          },
        },
      },
    });
  };

  getUntreated = async () => {
    const devis = await prisma.devi.count({
      where: {
        status: "APPROVED",
      }
    });

    const bcApproved = await prisma.command.count({
      where: {
        status: "APPROVED"
      }
    })

    const bcPending = await prisma.command.count({
      where: {
        status: "PENDING"
      }
    })

    return devis - (bcApproved + bcPending);
  };
}
