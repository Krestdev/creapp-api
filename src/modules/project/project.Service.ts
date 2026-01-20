import { PrismaClient, Project } from "@prisma/client";
import { CacheService } from "../../utils/redis";
import { getIO } from "../../socket";
const prisma = new PrismaClient();

export class ProjectService {
  CACHE_KEY = "project";
  async create(data: Omit<Project, "createdAt" | "updatedAt">) {
    const ref = "PRJ-" + new Date().getTime();

    await CacheService.del(`${this.CACHE_KEY}:all`);
    const project = await prisma.project.create({
      data: {
        reference: ref,
        label: data.label,
        description: data.description,
        chiefId: data.chiefId ?? null,
        budget: data.budget ?? 0,
      },
      include: {
        chief: {
          omit: {
            createdAt: true,
            updatedAt: true,
            email: true,
            password: true,
            phone: true,
            status: true,
            verificationOtp: true,
            verified: true,
            lastConnection: true,
          },
        },
      },
    });
    getIO().emit("project:new");
    return project;
  }

  async update(
    id: number,
    data: Partial<Omit<Project, "createdAt" | "updatedAt">>,
  ) {
    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.description !== undefined)
      updateData.description = data.description;

    await CacheService.del(`${this.CACHE_KEY}:all`);
    const project = await prisma.project.update({
      where: { id },
      data: { ...updateData, ...data },
    });
    getIO().emit("project:update");
    return project;
  }

  async delete(id: number) {
    await CacheService.del(`${this.CACHE_KEY}:all`);
    const project = await prisma.project.delete({
      where: { id },
    });
    getIO().emit("project:delete");
    return project;
  }

  async getAll() {
    const cached = await CacheService.get<Project[]>(`${this.CACHE_KEY}:all`);
    if (cached) return cached;

    const project = await prisma.project.findMany({
      include: {
        chief: {
          omit: {
            createdAt: true,
            updatedAt: true,
            email: true,
            password: true,
            phone: true,
            status: true,
            verificationOtp: true,
            verified: true,
            lastConnection: true,
          },
        },
      },
    });

    await CacheService.set(`${this.CACHE_KEY}:all`, project, 90);
    return project;
  }

  async getOne(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        chief: {
          omit: {
            createdAt: true,
            updatedAt: true,
            email: true,
            password: true,
            phone: true,
            status: true,
            verificationOtp: true,
            verified: true,
            lastConnection: true,
          },
        },
      },
    });
  }

  async getChief(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        chief: {
          omit: {
            createdAt: true,
            updatedAt: true,
            email: true,
            password: true,
            phone: true,
            status: true,
            verificationOtp: true,
            verified: true,
            lastConnection: true,
          },
        },
      },
    });
  }
}
