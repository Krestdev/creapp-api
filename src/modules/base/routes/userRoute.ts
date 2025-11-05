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
    this.routes.post(
      "/login",
      validateData("login"),
      this.userController.login
    );
    this.routes.get("/verify/:otp", this.userController.verify);
    this.routes.put("/:id", validateData("update"), this.userController.update);
    this.routes.delete(
      "/:id",
      validateData("delete"),
      this.userController.delete
    );

    this.routes.get("/role/list", this.userController.getRoles);
    this.routes.post(
      "/role/create",
      validateData("createRole"),
      this.userController.createRole
    );

    this.routes.post(
      "/:id/roles",
      validateData("addRole"),
      this.userController.addRole
    );
    this.routes.delete(
      "/:id/roles",
      validateData("removeRole"),
      this.userController.removeRole
    );

    this.routes.post(
      "/createRolePages",
      validateData("createRolePages"),
      this.userController.createRolePages
    );
    this.routes.delete(
      "/deleteRolePages",
      validateData("deleteRolePages"),
      this.userController.deleteRolePages
    );
    this.routes.post(
      "/addPageToRole",
      validateData("addPageToRole"),
      this.userController.addPageToRole
    );
    this.routes.patch(
      "/removePageFromRole",
      validateData("removePageFromRole"),
      this.userController.removePageFromRole
    );
    this.routes.get(
      "/rolePages/:roleId",
      validateData("getRolePages"),
      this.userController.getRolePages
    );
  }
}
