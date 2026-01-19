import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import AccountingController from "./accounting.Controller";
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

export default class AccountingRoute {
  routes: Router = Router();
  accountingController = new AccountingController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate);
    // create
    this.routes.post("/", requireRole("ACCOUNTANT", "ADMIN"), (req, res) => {
      this.accountingController
        .create(req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update
    this.routes.put("/:id", requireRole("ACCOUNTANT", "ADMIN"), (req, res) => {
      this.accountingController
        .update(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete(
      "/:id",
      requireRole("ACCOUNTANT", "ADMIN"),
      (req, res) => {
        this.accountingController
          .delete(req.params.id!)
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // getAll
    this.routes.get("/", requireRole("ACCOUNTANT", "ADMIN"), (req, res) => {
      this.accountingController
        .getAll()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", requireRole("ACCOUNTANT", "ADMIN"), (req, res) => {
      this.accountingController
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
