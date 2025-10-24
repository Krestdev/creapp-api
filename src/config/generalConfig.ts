import dotenv from "dotenv";
import { BASE_MODULE_CONFIG } from "./BaseModuleConfig";
import { REQUEST_MODULE_CONFIG } from "./RequestModuleConfig";
import { name } from "ejs";
dotenv.config();

export const env = process.env;
const isProduction = env.NODE_ENV === "production";

export const GENERAL_CONFIG = {
  app: {
    port: isProduction ? Number(env.APP_PORT) : 5000,
    key: isProduction ? env.API_KEY : "test-api-key",
    baseUrl: isProduction ? env.BASE_URL : `http://localhost`,
    name: isProduction ? env.APP_NAME : "Creapp",
  },
  email: {
    from: isProduction ? env.EMAIL_FROM : "noreply@example.com",
    smtp: {
      host: isProduction ? env.SMTP_HOST : "smtp.titan.email",
      port: isProduction ? Number(env.SMTP_PORT) : 465,
      user: isProduction ? env.SMTP_USER : "info@loumo.com",
      pass: isProduction ? env.SMTP_PASS : "admin@loumo2024",
    },
  },
  jwt: {
    SECRET: isProduction
      ? env.JWT_SECRET ?? "test-jwt-secret"
      : "test-jwt-secret",
  },
};
