import { env, isProduction } from "./generalConfig";

export const REQUEST_MODULE_CONFIG = {
  api: {
    key: isProduction ? env.API_KEY : "test-api-key",
    baseUrl: isProduction ? env.API_BASE_URL : "http://localhost:3000",
  },
};
