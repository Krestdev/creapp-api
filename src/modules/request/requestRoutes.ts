import { Router } from "express";
import RequestController from "./requestController";
import { request } from "../../../assets/messages/requestMessages.json";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class RequestRoute {
  routes: Router = Router();
  requestController = new RequestController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.get("/", (req, res) => {
      this.requestController
        .getAll()
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/:id", (req, res) => {
      this.requestController
        .getOne(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/mine/:id", (req, res) => {
      this.requestController
        .getMine(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post("/", (req, res) => {
      this.requestController
        .create(req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    this.routes.put("/:id", (req, res) => {
      this.requestController
        .update(req.params.id, req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    this.routes.delete("/:id", (req, res) => {
      this.requestController
        .delete(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/validate/:id", (req, res) => {
      this.requestController
        .validate(req.params.id, req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/review/:id", (req, res) => {
      this.requestController
        .reviewed(req.params.id, req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/reject/:id", (req, res) => {
      this.requestController
        .reject(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/priority/:id", (req, res) => {
      this.requestController
        .priority(req.params.id, req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    this.routes.put("/submit/:id", (req, res) => {
      this.requestController
        .submit(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
