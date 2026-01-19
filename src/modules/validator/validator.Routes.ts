import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import ValidatorController from "./validator.Controller";
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

export default class ValidatorRoute {
  routes: Router = Router();
  validatorController = new ValidatorController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate);
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.validatorController
        .deleteValidator(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.validatorController
        .getValidatorByCategory(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/:id", requireRole("USER"), (req, res) => {
      this.validatorController
        .updateOneValidator(req.params.id ?? "-1", req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
