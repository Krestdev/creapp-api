import { PrismaClient, Project } from "@prisma/client";
const prisma = new PrismaClient();

export class ProjectService {
  async create(data: Omit<Project, "createdAt" | "updatedAt">) {
    return prisma.project.create({ data });
  }

  async update(
    id: number,
    data: Partial<Omit<Project, "createdAt" | "updatedAt">>
  ) {
    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.description !== undefined)
      updateData.description = data.description;
    return prisma.project.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number) {
    return prisma.project.delete({
      where: { id },
    });
  }

  async getAll() {
    return prisma.project.findMany();
  }

  async getOne(id: number) {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  async getChief(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: { chief: true },
    });
  }
}
