import { env } from "./generalConfig";

export const BASE_MODULE_CONFIG = {
  endpoint: "base",
  version: "1.0.0",
  selected: Number(env.BASE_MODULE_SELECTED),
};
