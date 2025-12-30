import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import NotificationController from "./notificationController";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class NotificationRoute {
  routes: Router = Router();
  notificationController = new NotificationController();

  constructor() {
    this.config();
  }

  private config() {
    // create
    this.routes.post("/", (req, res) => {
      this.notificationController
        .create(req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update
    this.routes.put("/:id", (req, res) => {
      this.notificationController
        .update(req.params.id!, req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/:id", (req, res) => {
      this.notificationController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", (req, res) => {
      this.notificationController
        .getAll()
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", (req, res) => {
      this.notificationController
        .getOne(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
