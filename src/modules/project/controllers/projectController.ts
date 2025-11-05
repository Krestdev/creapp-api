import { Request, Response } from "express";
import { ProjectService } from "../services/projectServices";
import { project } from "../../../../assets/messages/projectMessages.json";

const { create, editProject, deleteProject, get_all, get_one, getChief } =
  project;

const projectService = new ProjectService();

export default class ProjectController {
  create = (req: Request, res: Response) => {
    projectService
      .create(req.body)
      .then((project) =>
        res.status(201).json({ message: create.success.create, data: project })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  update = (req: Request<{ id: string }>, res: Response) => {
    projectService
      .update(Number(req.params.id), req.body)
      .then((project) =>
        res.status(200).json({ message: editProject.success, data: project })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  delete = (req: Request<{ id: string }>, res: Response) => {
    projectService
      .delete(Number(req.params.id))
      .then(() => res.status(204).send({ message: deleteProject.success }))
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getAll = (req: Request, res: Response) => {
    projectService
      .getAll()
      .then((projects) =>
        res.status(200).json({ message: get_all.success.fetch, data: projects })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getOne = (req: Request<{ id: string }>, res: Response) => {
    projectService
      .getOne(Number(req.params.id))
      .then((project) =>
        res.status(200).json({ message: get_one.success.fetch, data: project })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getChief = (req: Request<{ id: string }>, res: Response) => {
    projectService
      .getChief(Number(req.params.id))
      .then((chief) =>
        res.status(200).json({ message: getChief.success.fetch, data: chief })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
}
