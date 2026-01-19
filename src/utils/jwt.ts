import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { GENERAL_CONFIG } from "../config";

const prisma = new PrismaClient();

export interface TokenPayload {
  userId: number;
  email: string;
  roles: string[];
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret: string = GENERAL_CONFIG.jwt.accessSecret;
  return jwt.sign(payload, secret, {
    expiresIn: GENERAL_CONFIG.jwt.accessExpiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret: string = GENERAL_CONFIG.jwt.refreshSecret;
  return jwt.sign(payload, secret, {
    expiresIn: GENERAL_CONFIG.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const secret: string = GENERAL_CONFIG.jwt.accessSecret;
  return jwt.verify(token, secret) as TokenPayload;
};

export const isUserActive = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user ? user.status == "active" : false;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret: string = GENERAL_CONFIG.jwt.refreshSecret;
  return jwt.verify(token, secret) as TokenPayload;
};
