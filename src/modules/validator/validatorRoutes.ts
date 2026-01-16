import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import ValidatorController from "./validatorController";

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
    this.routes.delete("/:id", (req, res) => {
      this.validatorController
        .deleteValidator(req.params.id)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/:id", (req, res) => {
      this.validatorController
        .getValidatorByCategory(req.params.id)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/:id", (req, res) => {
      this.validatorController
        .updateOneValidator(req.params.id, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
