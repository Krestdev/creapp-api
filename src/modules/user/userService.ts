import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GENERAL_CONFIG } from "../../config";
import Mailer from "../../utils/email";

const prisma = new PrismaClient();

function generateOTP(length = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

export class UserService {
  email = new Mailer();
  async create(
    data: User & { roleId: number; post?: string; department?: number }
  ) {
    // Try to find an existing role by label (use findFirst to avoid requiring a unique constraint on label)

    const { email, name, password } = data;
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    // Save OTP and set verified to false

    this.email
      .sendWelcomeEmail({
        userName: name,
        email,
        password,
        otp,
      })
      .catch((e) => {
        console.log(e);
        console.error("could not send mail");
      });

    let existingRole = await prisma.role.findFirst({
      where: {
        OR: [{ id: data.roleId }, { label: "USER" }],
      },
    });

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
        password: hashedPassword,
        verificationOtp: otp,
        role: {
          connect: { id: existingRole.id },
        },
        members: data.department
          ? {
              create: {
                departmentId: data.department,
                label: data.post ?? "Employee",
              },
            }
          : {},
      },
      include: { role: true },
      omit: { password: true },
    });
    return user;
  }

  // Verify account with OTP
  async verifyAccount(email: string, otp: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verified || user.verificationOtp !== otp) {
      return false;
    }
    await prisma.user.update({
      where: { email },
      data: {
        verified: true,
        verificationOtp: null,
        status: "active",
      },
    });
    return true;
  }

  async login(data: { email: string; password: string }) {
    console.log("User login");
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true, validators: true },
    });
    if (!user || !user.verified)
      throw new Error("Invalid credentials or unverified account");
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error("Invalid credentials");
    const token = jwt.sign({ userId: user.id }, GENERAL_CONFIG.jwt.SECRET, {
      expiresIn: "1d",
    });
    console.log("User logged in", user.email);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastConnection: new Date(),
      },
    });
    return { user, token };
  }

  async update(id: number, data: Partial<User> & { role: number[] }) {
    // If a role is provided, find or create it
    // let roleConnectOrCreate;
    // if (data.role) {
    //   const existingRole = await prisma.role.findFirst({
    //     where: { label: data.role },
    //   });
    //   roleConnectOrCreate = existingRole
    //     ? { connect: { id: existingRole.id } }
    //     : { create: { label: data.role } };
    // }

    // Build an update object that only includes provided fields to avoid assigning undefined.
    const updateData: Partial<User> = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password !== undefined) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateData.password = hashedPassword;
    }
    // if (roleConnectOrCreate !== undefined)
    //   updateData.role = roleConnectOrCreate;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        role: {
          set: data.role.map((id) => {
            return { id };
          }),
        },
      },
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

  changeStatus(id: number, status: string) {
    console.log(status);
    return prisma.user.update({
      where: { id },
      data: {
        status,
      },
      omit: {
        password: true,
        phone: true,
        email: true,
        lastConnection: true,
        createdAt: true,
        updatedAt: true,
        verificationOtp: true,
        verified: true,
      },
    });
  }

  getAll() {
    return prisma.user.findMany({
      include: {
        role: true,
        validators: true,
        members: { include: { department: true } },
      },
      omit: { password: true },
    });
  }

  getOne(id: number) {
    return prisma.user.findFirstOrThrow({
      where: { id },
      include: { role: true, validators: true },
      omit: { password: true },
    });
  }

  createRole(data: { label: string }) {
    return prisma.role.create({
      data,
    });
  }

  deleteRole(id: number) {
    return prisma.role.delete({
      where: { id },
    });
  }

  updateRole(id: number, data: { label: string }) {
    return prisma.role.update({
      where: { id },
      data,
    });
  }

  addRoleToUser(userId: number, roleId: string) {
    return prisma.user.update({
      where: { id: userId },
      include: { role: true },
      data: {
        role: {
          connect: { id: parseInt(roleId, 10) },
        },
      },
    });
  }

  removeRoleFromUser(userId: number, roleId: number) {
    return prisma.user.update({
      where: { id: userId },
      include: { role: true },
      data: {
        role: {
          disconnect: { id: roleId },
        },
      },
    });
  }

  getRoles() {
    return prisma.role.findMany({
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  createRolePages(pageIds: string[]) {
    return prisma.rolePages.createMany({
      data: pageIds.map((pageId) => ({
        pageId,
      })),
    });
  }

  deleteRolePages(rolePageIds: number[]) {
    return prisma.rolePages.deleteMany({
      where: {
        id: { in: rolePageIds },
      },
    });
  }

  addPageToRole(roleId: number, rolePageId: number) {
    return prisma.rolePages.update({
      where: { id: rolePageId },
      data: {
        authorized: {
          connect: { id: roleId },
        },
      },
    });
  }

  async removePageFromRole(roleId: number, pageId: string) {
    const pages = await prisma.rolePages.findMany({
      where: { pageId: { startsWith: pageId } },
    });
    // For non-parent pages, find the exact page record and update it.
    const page = pages.find((p) => p.pageId === pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    // updateMany does not support nested relation operations like disconnect,
    // so perform per-record updates to disconnect the relation.
    return Promise.all(
      pages.map((p) =>
        prisma.rolePages.update({
          where: { id: p.id },
          data: {
            authorized: {
              disconnect: { id: roleId },
            },
          },
        })
      )
    );
  }

  getRolePages(roleId: number) {
    return prisma.rolePages.findMany({
      where: { authorized: { some: { id: roleId } } },
    });
  }
}
