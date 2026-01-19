import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import ReceptionController from "./reception.Controller";
import upload from "../../utils/upload";
import { requireRole } from "../../middlewares/rbac.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class ReceptionRoute {
  routes: Router = Router();
  receptionController = new ReceptionController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // create
    this.routes.post("/", requireRole("USER"), (req, res) => {
      this.receptionController
        .create(req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update
    this.routes.put(
      "/:id",
      upload.array("Proof"),
      requireRole("USER"),
      (req, res) => {
        this.receptionController
          .update(req.params.id!, { ...req.body, proof: req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // delete
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.receptionController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.receptionController
        .getAll()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.receptionController
        .getOne(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
