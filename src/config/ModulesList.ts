import { BASE_MODULE_CONFIG } from "./BaseModuleConfig";
import { GENERAL_CONFIG } from "./generalConfig";
import { PROJECT_MODULE_CONFIG } from "./ProjectModuleConfig";
import { REQUEST_MODULE_CONFIG } from "./RequestModuleConfig";

export const MODULES_LIST = [
  {
    name: "baseModule",
    version: BASE_MODULE_CONFIG.version,
    endpoint: BASE_MODULE_CONFIG.endpoint,
    url: `${GENERAL_CONFIG.app.baseUrl}:${GENERAL_CONFIG.app.port}/api/v${REQUEST_MODULE_CONFIG.version}/${BASE_MODULE_CONFIG.endpoint}`,
    selected: BASE_MODULE_CONFIG.selected,
    status: "undetermined",
  },
  {
    name: "requestModule",
    version: REQUEST_MODULE_CONFIG.version,
    endpoint: REQUEST_MODULE_CONFIG.endpoint,
    url: `${GENERAL_CONFIG.app.baseUrl}:${GENERAL_CONFIG.app.port}/api/v${REQUEST_MODULE_CONFIG.version}/${REQUEST_MODULE_CONFIG.endpoint}`,
    selected: REQUEST_MODULE_CONFIG.selected,
    status: "undetermined",
  },
  {
    name: "projectModule",
    version: PROJECT_MODULE_CONFIG.version,
    endpoint: PROJECT_MODULE_CONFIG.endpoint,
    url: `${GENERAL_CONFIG.app.baseUrl}:${GENERAL_CONFIG.app.port}/api/v${PROJECT_MODULE_CONFIG.version}/${PROJECT_MODULE_CONFIG.endpoint}`,
    selected: PROJECT_MODULE_CONFIG.selected,
    status: "undetermined",
  },
];
