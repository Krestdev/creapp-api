import { Router } from "express";
import ProjectController from "./project.Controller";
import { project } from "../../../assets/messages/projectMessages.json";
import { requireRole } from "../../middlewares/rbac.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const { create, editProject, deleteProject, get_all, get_one, getChief } =
  project;

export default class ProjectRouter {
  routes: Router = Router();
  projectController: ProjectController = new ProjectController();
  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // get all projects
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.projectController
        .getAll()
        .then((projects) =>
          res
            .status(200)
            .json({ message: get_all.success.fetch, data: projects }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    // get a single project by id
    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.projectController
        .getOne(req.params.id ?? "-1")
        .then((project) =>
          res
            .status(200)
            .json({ message: get_one.success.fetch, data: project }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // create a new project
    this.routes.post("/", requireRole("USER"), (req, res) => {
      this.projectController
        .create(req.body)
        .then((project) =>
          res
            .status(200)
            .json({ message: create.success.create, data: project }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update an existing project
    this.routes.put("/:id", requireRole("USER"), (req, res) => {
      this.projectController
        .update(req.params.id!, req.body)
        .then((project) =>
          res.status(200).json({ message: editProject.success, data: project }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    // delete a project
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.projectController
        .delete(req.params.id ?? "-1")
        .then(() => res.status(204).send({ message: deleteProject.success }))
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // get project chief
    this.routes.get("/:id/chief", requireRole("USER"), (req, res) => {
      this.projectController
        .getChief(req.params.id ?? "-1")
        .then((chief) =>
          res
            .status(200)
            .json({ message: getChief.success.fetch, data: chief }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
