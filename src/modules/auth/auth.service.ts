import { hashPassword, comparePassword } from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "../../utils/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleIds: number[];
}

export class AuthService {
  async login(credentials: LoginCredentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        role: true,
      },
    });

    if (!user || user.status !== "active") {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await comparePassword(
      credentials.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const roles = user.role.map((ur) => ur.label);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // await createAuditLog({
    //   userId: user.id,
    //   action: "LOGIN",
    //   entity: "User",
    //   entityId: user.id,
    // });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        roles,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const { verifyRefreshToken, generateAccessToken } =
        await import("../../utils/jwt");
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          role: true,
        },
      });

      if (!user || user.status !== "active") {
        throw new Error("User not found or inactive");
      }

      const roles = user.role.map((ur) => ur.label);

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roles,
      };

      const newAccessToken = generateAccessToken(newPayload);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? "",
        password: passwordHash,
        role: {
          connect: data.roleIds.map((roleId) => ({
            id: roleId,
          })),
        },
      },
      include: {
        role: true,
      },
    });

    // await createAuditLog({
    //   userId: user.id,
    //   action: "CREATE",
    //   entity: "User",
    //   entityId: user.id,
    // });

    const roles = user.role.map((ur) => ur.label);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roles,
    };
  }
}
