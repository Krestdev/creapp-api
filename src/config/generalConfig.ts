import dotenv from "dotenv";
dotenv.config();

export const env = process.env;
const isProduction = env.NODE_ENV === "production";

function parsePort(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n < 65536 ? n : fallback;
}

export const GENERAL_CONFIG = {
  app: {
    port: isProduction
      ? parsePort(env.API_PORT, 5000)
      : parsePort(env.API_PORT, 5000),
    key: isProduction ? env.API_KEY : "test-api-key",
    baseUrl: isProduction ? env.BASE_URL : `http://localhost`,
    frontend: env.FRONT_END,
    name: isProduction ? env.APP_NAME : "Creapp",
    contact: env.APP_CONTACT,
  },
  email: {
    from: isProduction ? env.EMAIL_FROM : "contact@krestdev.com",
    smtp: {
      host: isProduction ? env.SMTP_HOST : "smtp.titan.email",
      port: isProduction ? Number(env.SMTP_PORT) : 465,
      user: isProduction ? env.SMTP_USER : "contact@krestdev.com",
      pass: isProduction ? env.SMTP_PASS : "Krestdev@2024",
    },
  },
  jwt: {
    SECRET: isProduction
      ? (env.JWT_SECRET ?? "test-jwt-secret")
      : "test-jwt-secret",
    accessSecret: process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },
};
