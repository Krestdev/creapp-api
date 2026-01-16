import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import BankController from "./bankController";
import upload from "../../utils/upload";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class BankRoute {
  routes: Router = Router();
  bankController = new BankController();

  constructor() {
    this.config();
  }

  private config() {
    // create
    this.routes.post(
      "/",
      upload.fields([{ name: "justification", maxCount: 5 }]),
      (req, res) => {
        this.bankController
          .create({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    // update
    this.routes.put(
      "/:id",
      upload.fields([{ name: "justification", maxCount: 5 }]),
      (req, res) => {
        this.bankController
          .update(req.params.id!, { ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    // delete
    this.routes.delete("/:id", (req, res) => {
      this.bankController
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
      this.bankController
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
      this.bankController
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
