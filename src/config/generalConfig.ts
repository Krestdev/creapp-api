import dotenv from "dotenv";
import { BASE_MODULE_CONFIG } from "./BaseModuleConfig";
import { REQUEST_MODULE_CONFIG } from "./RequestModuleConfig";
dotenv.config();

export const env = process.env;
const isProduction = env.NODE_ENV === "production";

export const GENERAL_CONFIG = {
  app: {
    port: isProduction ? Number(env.APP_PORT) : 5000,
    key: isProduction ? env.API_KEY : "test-api-key",
    baseUrl: isProduction ? env.BASE_URL : `http://localhost`,
  },
};
