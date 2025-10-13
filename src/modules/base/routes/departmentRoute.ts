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
    // get all departments
    this.routes.get("/", this.departmentController.getAll);

    // get a single department by id
    this.routes.get(
      "/:id",
      validateData("get"),
      this.departmentController.getOne
    );

    // create a new department
    this.routes.post(
      "/",
      validateData("create"),
      this.departmentController.create
    );

    // update an existing department
    this.routes.put(
      "/:id",
      validateData("update"),
      this.departmentController.update
    );

    // delete a department
    this.routes.delete(
      "/:id",
      validateData("delete"),
      this.departmentController.delete
    );

    // get all department members
    this.routes.get(
      "/:id/members",
      validateData("get"),
      this.departmentController.getMembers
    );

    // add a member to a department
    this.routes.post(
      "/:id/members",
      validateData("addMember"),
      this.departmentController.addMember
    );

    // remove a member from a department
    this.routes.delete(
      "/:id/members",
      validateData("removeMember"),
      this.departmentController.removeMember
    );

    // get all department validators
    this.routes.get(
      "/:id/validators",
      validateData("get"),
      this.departmentController.getValidators
    );

    // add a validator to a department
    this.routes.post(
      "/:id/validators",
      validateData("addValidator"),
      this.departmentController.addValidator
    );

    // remove a validator from a department
    this.routes.delete(
      "/:id/validators",
      validateData("removeValidator"),
      this.departmentController.removeValidator
    );

    // add a department final validators
    this.routes.post(
      "/:id/final-validators",
      validateData("addFinalValidator"),
      this.departmentController.addFinalValidator
    );

    this.routes.get(
      "/:id/final-validators",
      validateData("get"),
      this.departmentController.getFinalValidators
    );

    // remove a department final validators
    this.routes.delete(
      "/:id/final-validators",
      validateData("removeFinalValidator"),
      this.departmentController.removeFinalValidator
    );

    // set department chief
    this.routes.post(
      "/:id/chief",
      validateData("setDepartmentChief"),
      this.departmentController.setDepartmentChief
    );

    // unset department chief
    this.routes.delete(
      "/:id/chief",
      validateData("setDepartmentChief"),
      this.departmentController.unSetDepartmentChief
    );
  }
}
