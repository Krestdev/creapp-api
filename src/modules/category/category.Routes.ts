import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import CategoryController from "./category.Controller";
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

export default class CategoryRoute {
  routes: Router = Router();
  categoryController = new CategoryController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate);
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.categoryController
        .deleteCategory(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.categoryController
        .getGategory()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.categoryController
        .getOneCategory(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/:id", requireRole("USER"), (req, res) => {
      this.categoryController
        .updateOneCategory(req.params.id ?? "-1", req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post("/", requireRole("USER"), (req, res) => {
      this.categoryController
        .createCategory(req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
