import { PrismaClient, User } from "@prisma/client";
import Mailer from "../../../utils/email";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GENERAL_CONFIG } from "../../../config";

const prisma = new PrismaClient();

function generateOTP(length = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

export class UserService {
  email = new Mailer();
  async create(data: User & { roleId: number }) {
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
        loginUrl: `${GENERAL_CONFIG.app.baseUrl}/auth/register/${otp}?email=${email}`,
      })
      .catch((error) => {
        console.error("could not send mail");
      });

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
        password: hashedPassword,
        verificationOtp: otp,
        role: {
          connect: { id: existingRole.id },
        },
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
      },
    });
    return true;
  }

  async login(data: { email: string; password: string }) {
    console.log("User login");
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });
    if (!user || !user.verified)
      throw new Error("Invalid credentials or unverified account");
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error("Invalid credentials");
    const token = jwt.sign({ userId: user.id }, GENERAL_CONFIG.jwt.SECRET, {
      expiresIn: "1d",
    });
    console.log("User logged in", user.email);
    return { user, token };
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
