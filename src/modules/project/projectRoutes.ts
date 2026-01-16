import { Router } from "express";
import ProjectController from "./projectController";
import { project } from "../../../assets/messages/projectMessages.json";

const { create, editProject, deleteProject, get_all, get_one, getChief } =
  project;

export default class ProjectRouter {
  routes: Router = Router();
  projectController: ProjectController = new ProjectController();
  constructor() {
    this.config();
  }

  private config() {
    // get all projects
    this.routes.get("/", (req, res) => {
      this.projectController
        .getAll()
        .then((projects) =>
          res
            .status(200)
            .json({ message: get_all.success.fetch, data: projects })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    // get a single project by id
    this.routes.get("/:id", (req, res) => {
      this.projectController
        .getOne(req.params.id)
        .then((project) =>
          res
            .status(200)
            .json({ message: get_one.success.fetch, data: project })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // create a new project
    this.routes.post("/", (req, res) => {
      this.projectController
        .create(req.body)
        .then((project) =>
          res
            .status(200)
            .json({ message: create.success.create, data: project })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update an existing project
    this.routes.put("/:id", (req, res) => {
      this.projectController
        .update(req.params.id!, req.body)
        .then((project) =>
          res.status(200).json({ message: editProject.success, data: project })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    // delete a project
    this.routes.delete("/:id", (req, res) => {
      this.projectController
        .delete(req.params.id)
        .then(() => res.status(204).send({ message: deleteProject.success }))
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // get project chief
    this.routes.get("/:id/chief", (req, res) => {
      this.projectController
        .getChief(req.params.id)
        .then((chief) =>
          res.status(200).json({ message: getChief.success.fetch, data: chief })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
