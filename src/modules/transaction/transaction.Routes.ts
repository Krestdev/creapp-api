import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import TransactionController from "./transaction.Controller";
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

export default class TransactionRoute {
  routes: Router = Router();
  trTransactionController = new TransactionController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // create
    this.routes.post(
      "/",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .create({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put(
      "/:id",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .update(req.params.id!, { ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put("/validate/:id", requireRole("USER"), (req, res) => {
      this.trTransactionController
        .validate(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.trTransactionController
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
      this.trTransactionController
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
      this.trTransactionController
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
