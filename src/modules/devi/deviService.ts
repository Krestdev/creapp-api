import { Devi, DeviElement, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DeviService {
  // Create

  create = (data: Devi, elements: DeviElement[]) => {
    const ref = "ref-" + new Date().getTime();
    // | "SUBMITTED" Soumis, en attente d’analyse / comparaison
    // | "APPROVED" Toutes les lignes du devis sont retenues
    // | "REJECTED" Aucune ligne retenue
    // | "PENDING";
    return prisma.devi.create({
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
  };

  // Update
  update = (id: number, data: Devi, elements: DeviElement[]) => {
    const existing = elements.filter((e) => !!e.id);
    const toCreate = elements.filter((e) => !e.id);
    const existingIds = existing.map((e) => e.id);

    // | "SELECTED"         // Ligne retenue par le DO pour passer en BC
    // | "NOT_SELECTED"     // Ligne explicitement non retenue

    return prisma.devi.update({
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
    }[]
  ) => {
    const elements = data.map((el) => el.elements).flat();
    const elementIds = elements.map((el) => el.elementIds[0]!);
    const DelementIds = elements.map((el) => el.elementIds).flat();

    //  find all the requests linked to the commandRequest
    const requestList = await prisma.requestModel.findMany({
      where: {
        deviElements: {
          some: {
            id: {
              in: elementIds,
            },
          },
        },
      },
    });

    await prisma.deviElement.updateMany({
      where: {
        id: {
          in: DelementIds,
        },
      },
      data: { status: "SELECTED" },
    });

    await prisma.deviElement.updateMany({
      where: {
        id: {
          notIn: DelementIds,
        },
        requestModelId: {
          in: requestList.map((r) => r.id),
        },
      },
      data: {
        status: "REJECTED",
      },
    });

    // console.log(data.map((d) => d.deviId));

    await prisma.devi.updateMany({
      where: {
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

    return prisma.devi.updateMany({
      where: {
        id: {
          in: data.map((d) => d.deviId),
        },
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
        element: true,
        commandRequest: {
          include: {
            besoins: true,
          },
        },
      },
    });
  };
}
