import { env } from "./generalConfig";

export const REQUEST_MODULE_CONFIG = {
  endpoint: "request",
  version: "1.0.0",
  selected: Number(env.REQUEST_MODULE_SELECTED),
};
