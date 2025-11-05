import { env } from "./generalConfig";

export const PROJECT_MODULE_CONFIG = {
  endpoint: "project",
  version: "1.0.0",
  selected: Number(env.PROJECT_MODULE_SELECTED),
};
