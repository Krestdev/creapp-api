import { Request, Response } from "express";
import { RequestService } from "../services/requestService";
import { request } from "../../../../assets/messages/requestMessages.json";

const { create, update, delete_request, get_all, get_my_requests, get_by_id } =
  request;

const requestService = new RequestService();

export default class RequestController {
  create = (req: Request, res: Response) => {
    requestService
      .create(req.body)
      .then((request) =>
        res.status(201).json({ message: create.success.create, data: request })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  update = (req: Request, res: Response) => {
    requestService
      .update(Number(req.params.id), req.body)
      .then((request) =>
        res.status(201).json({ message: create.success.create, data: request })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getAll = (req: Request, res: Response) => {
    requestService
      .getAll()
      .then((request) =>
        res.status(201).json({ message: create.success.create, data: request })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getOne = (req: Request, res: Response) => {
    requestService
      .getOne(Number(req.params.id))
      .then((request) =>
        res.status(201).json({ message: create.success.create, data: request })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getMine = (req: Request, res: Response) => {
    // needs user Id
    requestService
      .getMine(req.body)
      .then((request) =>
        res.status(201).json({ message: create.success.create, data: request })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  delete = (req: Request, res: Response) => {
    requestService
      .delete(Number(req.params.id))
      .then((request) =>
        res.status(201).json({ message: create.success.create, data: request })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
}
