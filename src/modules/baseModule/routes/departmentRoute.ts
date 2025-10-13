import { Router } from "express";
import DepartmentController from "../controllers/departmentController";
import { validateData } from "../../../middlewares/departmentValidation";

export default class DepartmentRouter {
  routes: Router = Router();
  departmentController: DepartmentController = new DepartmentController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.get("/", this.departmentController.getAll);
    this.routes.get(
      "/:id",
      validateData("get"),
      this.departmentController.getOne
    );
    this.routes.post(
      "/",
      validateData("create"),
      this.departmentController.create
    );
    this.routes.put(
      "/:id",
      validateData("update"),
      this.departmentController.update
    );
    this.routes.delete(
      "/:id",
      validateData("delete"),
      this.departmentController.delete
    );
    this.routes.get(
      "/:id/members",
      validateData("get"),
      this.departmentController.getMembers
    );
    this.routes.post(
      "/members",
      validateData("addMember"),
      this.departmentController.addMember
    );
    this.routes.delete(
      "/members",
      validateData("removeMember"),
      this.departmentController.removeMember
    );
    this.routes.get(
      "/:id/validators",
      validateData("get"),
      this.departmentController.getValidators
    );
    this.routes.post(
      "/validators",
      validateData("addValidator"),
      this.departmentController.addValidator
    );
    this.routes.delete(
      "/validators",
      validateData("removeValidator"),
      this.departmentController.removeValidator
    );
    this.routes.post(
      "/:id/final-validators",
      validateData("addFinalValidator"),
      this.departmentController.addFinalValidator
    );
    this.routes.delete(
      "/:id/final-validators",
      validateData("removeFinalValidator"),
      this.departmentController.removeFinalValidator
    );
    this.routes.post(
      "/:id/chief",
      validateData("setDepartmentChief"),
      this.departmentController.setDepartmentChief
    );
  }
}
