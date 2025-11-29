import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import morgan from "morgan";
import {
  GENERAL_CONFIG,
  REQUEST_MODULE_CONFIG,
  BASE_MODULE_CONFIG,
  MODULES_LIST,
} from "./config";
import { checkModules, findIpAddress } from "./utils/serverUtils";
import { connectBaseRoutes } from "./modules/base/routes";
import { PROJECT_MODULE_CONFIG } from "./config/ProjectModuleConfig";
import { connectProjectRoutes } from "./modules/project/routes";
import { connectRequestRoutes } from "./modules/request/routes";
import * as swaggerUI from "swagger-ui-express";
import * as swaggerJson from "../build/swagger.json";

class ApiServer {
  private app = express();

  // app urls
  private appUrl = [
    {
      url: "baseUrl",
      value: `${GENERAL_CONFIG.app.baseUrl}:${GENERAL_CONFIG.app.port}`,
    },
    {
      url: "Api",
      value: `http://${findIpAddress()}:${GENERAL_CONFIG.app.port}`,
    },
  ];

  // server construction
  constructor() {
    this.app.use(morgan("dev"));
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded());
    this.app.use(bodyParser.json());
  }

  // connect base module
  baseModule() {
    this.app.use(
      `/api/v${BASE_MODULE_CONFIG.version}/${BASE_MODULE_CONFIG.endpoint}`,
      connectBaseRoutes()
    );
  }

  // connect request module
  requestModule() {
    this.app.use(
      `/api/v${REQUEST_MODULE_CONFIG.version}/${REQUEST_MODULE_CONFIG.endpoint}`,
      connectRequestRoutes()
    );
  }

  // connect request module
  projectModule() {
    this.app.use(
      `/api/v${PROJECT_MODULE_CONFIG.version}/${PROJECT_MODULE_CONFIG.endpoint}`,
      connectProjectRoutes()
    );
  }

  // connect selected modules
  connectModules() {
    for (const module of MODULES_LIST) {
      if (module.selected) {
        switch (module.name) {
          case "baseModule":
            this.baseModule();
            break;

          case "requestModule":
            this.requestModule();
            break;

          case "projectModule":
            this.projectModule();
            break;

          default:
            break;
        }
      }
    }
  }

  public start() {
    this.connectModules();
    this.app.use(
      ["/openapi", "/docs", "/swagger"],
      swaggerUI.serve,
      swaggerUI.setup(swaggerJson)
    );
    this.app.listen(GENERAL_CONFIG.app.port, async () => {
      // Server end point
      console.log(`Server is running on port ${GENERAL_CONFIG.app.port}`);

      // server base urls
      console.table([
        ...this.appUrl,
        { url: "docs", value: "http://localhost:5000/docs" },
      ]);

      const ModulesState = await checkModules(MODULES_LIST);
      // server modules
      console.table(ModulesState);
    });
  }
}

const apiServer = new ApiServer();
apiServer.start();
