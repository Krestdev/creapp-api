import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { GENERAL_CONFIG, REQUEST_MODULE_CONFIG } from "./config";

class ApiServer {
  private app = express();

  constructor() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded());
    this.app.use(bodyParser.json());
  }

  public start() {
    this.app.listen(GENERAL_CONFIG.app.port, () => {
      console.log(
        `Server is running on port ${GENERAL_CONFIG.app.port} \n request Module baseurl: ${REQUEST_MODULE_CONFIG.api.baseUrl}`
      );
    });
  }
}

const apiServer = new ApiServer();
apiServer.start();
