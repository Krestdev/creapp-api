import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function apiKeyMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("ApiKey ")) {
    return res.status(401).json({ message: "API key missing" });
  }

  const key = header.replace("ApiKey ", "");
  const [prefix, secret] = key.split(".");

  if (!prefix || !secret) {
    return res.status(401).json({ message: "Invalid API key format" });
  }

  const publicId = prefix.replace("pk_live_", "");

  const apiKey = await prisma.apiKey.findFirst({
    where: { publicId, isActive: true },
  });

  if (!apiKey) {
    return res.status(401).json({ message: "API key not found" });
  }

  const hashedIncomingSecret = crypto
    .createHash("sha256")
    .update(secret)
    .digest("hex");

  if (hashedIncomingSecret !== apiKey.hashedSecret) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  apiKey.lastUsedAt = new Date();
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  req.apiKey = apiKey;
  next();
}
