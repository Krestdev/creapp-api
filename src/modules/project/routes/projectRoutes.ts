import { Router } from "express";
import ProjectController from "../controllers/projectController";

export default class ProjectRouter {
  routes: Router = Router();
  projectController: ProjectController = new ProjectController();
  constructor() {
    this.config();
  }

  private config() {
    // get all projects
    this.routes.get("/", this.projectController.getAll);
    // get a single project by id
    this.routes.get("/:id", this.projectController.getOne);
    // create a new project
    this.routes.post("/", this.projectController.create);
    // update an existing project
    this.routes.put("/:id", this.projectController.update);
    // delete a project
    this.routes.delete("/:id", this.projectController.delete);
    // get project chief
    this.routes.get("/:id/chief", this.projectController.getChief);
  }
}
