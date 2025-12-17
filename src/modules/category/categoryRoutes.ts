import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import CategoryController from "./categoryController";

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
    this.routes.get("/special", (req, res) => {
      this.categoryController
        .getSpecialCategories()
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.delete("/:id", (req, res) => {
      this.categoryController
        .deleteCategory(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/", (req, res) => {
      this.categoryController
        .getGategory()
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/:id", (req, res) => {
      this.categoryController
        .getOneCategory(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/:id", (req, res) => {
      this.categoryController
        .updateOneCategory(req.params.id, req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.put("/:id/children", (req, res) => {
      this.categoryController
        .getChilrenCategories(req.params.id)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    this.routes.post("/", (req, res) => {
      this.categoryController
        .createCategory(req.body)
        .then((request) =>
          res
            .status(201)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
