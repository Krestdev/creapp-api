import { Router } from "express";
import RequestController from "../controllers/requestController";

export default class RequestRoute {
  routes: Router = Router();
  requestController = new RequestController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.get("/", this.requestController.getAll);
    this.routes.get("/:id", this.requestController.getOne);
    this.routes.post("/", this.requestController.create);
    this.routes.put("/:id", this.requestController.update);
    this.routes.delete("/:id", this.requestController.delete);

    this.routes.put("/validate/:id", this.requestController.validate);
    this.routes.put("/reject/:id", this.requestController.reject);
    this.routes.put("/priority/:id", this.requestController.priority);
    this.routes.put("/submit/:id", this.requestController.submit);
  }
}
