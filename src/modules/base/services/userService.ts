import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
  async create(data: User & { roleId: number }) {
    // Try to find an existing role by label (use findFirst to avoid requiring a unique constraint on label)
    let existingRole = await prisma.role.findUnique({
      where: { id: data.roleId ?? -1 },
    });

    if (existingRole === null) {
      existingRole = await prisma.role.findFirst({
        where: { label: "USER" },
      });
    }

    if (existingRole === null) {
      existingRole = await prisma.role.create({
        data: { label: "USER" },
      });
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password,
        role: {
          connect: { id: existingRole.id },
        },
      },
      include: { role: true },
      omit: { password: true },
    });
    return user;
  }

  async update(id: number, data: Partial<User> & { role?: string }) {
    // If a role is provided, find or create it
    let roleConnectOrCreate;
    if (data.role) {
      const existingRole = await prisma.role.findFirst({
        where: { label: data.role },
      });
      roleConnectOrCreate = existingRole
        ? { connect: { id: existingRole.id } }
        : { create: { label: data.role } };
    }

    // Build an update object that only includes provided fields to avoid assigning undefined.
    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password !== undefined) updateData.password = data.password;
    if (roleConnectOrCreate !== undefined)
      updateData.role = roleConnectOrCreate;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
      omit: { password: true },
    });
    return user;
  }

  delete(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }

  getAll() {
    return prisma.user.findMany({
      include: { role: true },
      omit: { password: true },
    });
  }

  getOne(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
      omit: { password: true },
    });
  }
}
