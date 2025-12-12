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
    // const devis = [
    //   {
    //     deviId: 1,
    //     elements: [
    //       {
    //         name: "group1",
    //         elementIds: [1, 2, 3, 4, 5],
    //       },
    //     ],
    //   },
    // ];
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
      },
    });
  };

  // Get one
  getOne = (id: number) => {
    return prisma.devi.findUniqueOrThrow({
      where: { id },
    });
  };
}
