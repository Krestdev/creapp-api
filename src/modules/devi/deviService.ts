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

    return prisma.devi
      .update({
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
      })
      .catch((e) => {
        console.log(e, existing, toCreate);
        throw e;
      });
  };

  validateDevi = (
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
    // identify all requests concerned
    return Promise.all(
      data.map(async (devi) => {
        await prisma.devi.updateMany({
          where: {
            id: {
              notIn: [devi.deviId],
            },
            commandRequestId: {
              equals: devi.commandRequestId,
            },
          },
          data: {
            status: "REJECTED",
          },
        });

        const deviUpdated = await prisma.devi.update({
          where: {
            id: devi.deviId,
          },
          data: {
            element: {
              updateMany: {
                where: {
                  id: {
                    notIn: devi.elements.map((x) => x.elementIds).flat(),
                  },
                },
                data: {
                  status: "REJECTED",
                },
              },
            },
          },
          include: {
            provider: true,
            command: true,
          },
        });

        const deviElements = await prisma.deviElement.findMany({
          where: {
            deviId: devi.deviId,
            status: "SELECTED",
          },
        });

        await prisma.reception.create({
          data: {
            Reference: "REC-" + new Date().getTime(),
            Deadline: new Date(),
            Status: "PENDING",
            Proof: "",
            user: {
              connect: { id: devi.userId },
            },
            Provider: {
              connect: {
                id: deviUpdated.providerId,
              },
            },
            Deliverables: {
              connect: deviElements.map((el) => ({ id: el.id })),
            },
          },
        });

        return prisma.devi.update({
          where: {
            id: devi.deviId,
          },
          data: {
            status: "APPROVED",
            element: {
              updateMany: {
                where: {
                  id: {
                    in: devi.elements.map((x) => x.elementIds).flat(),
                  },
                },
                data: {
                  status: "SELECTED",
                },
              },
            },
          },
        });
      })
    );
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
