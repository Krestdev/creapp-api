import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import SignatairController from "./signatairController";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class SignatairRoute {
  routes: Router = Router();
  signatiarController = new SignatairController();

  constructor() {
    this.config();
  }

  private config() {
    // create
    this.routes.post("/", (req, res) => {
      this.signatiarController
        .create(req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update
    this.routes.put("/:id", (req, res) => {
      this.signatiarController
        .update(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/:id", (req, res) => {
      this.signatiarController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", (req, res) => {
      this.signatiarController
        .getAll()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", (req, res) => {
      this.signatiarController
        .getOne(req.params.id)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
