import { Router } from "express";
import UserController from "../controllers/userController";
import { validateData } from "../../../middlewares/userValidation";

export default class UserRouter {
  routes: Router = Router();
  userController: UserController = new UserController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.get("/", this.userController.getAll);
    this.routes.get("/:id", validateData("get"), this.userController.getOne);
    this.routes.post(
      "/register",
      validateData("create"),
      this.userController.create
    );
    this.routes.put("/:id", validateData("update"), this.userController.update);
    this.routes.delete(
      "/:id",
      validateData("delete"),
      this.userController.delete
    );
  }
}
