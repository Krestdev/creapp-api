import dotenv from "dotenv";
dotenv.config();

export const env = process.env;
export const isProduction = env.NODE_ENV === "production";

export const GENERAL_CONFIG = {
  app: {
    port: isProduction ? Number(env.APP_PORT) : 4000,
  },
};
