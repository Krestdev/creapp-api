import { Router } from "express";
import DepartmentController from "./department.Controller";
import { validateData } from "../../middlewares/departmentValidation";
import { department } from "../../../assets/messages/departmentMessages.json";
import { requireRole } from "../../middlewares/rbac.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const {
  create,
  update,
  deleteDepartment,
  get_all,
  get_one,
  get_members,
  add_member,
  remove_member,
  get_validators,
  add_validator,
  remove_validator,
  add_final_validator,
  remove_final_validator,
  get_final_validators,
  set_department_chief,
  unset_department_chief,
} = department;

export default class DepartmentRouter {
  routes: Router = Router();
  departmentController: DepartmentController = new DepartmentController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // get all departments
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.departmentController
        .getAll()
        .then((departments) =>
          res
            .status(200)
            .json({ message: get_all.success.fetch, data: departments }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // get a single department by id
    this.routes.get(
      "/:id",
      validateData("get"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .getOne(req.params.id!)
          .then((department) =>
            res
              .status(200)
              .json({ message: get_one.success.fetch, data: department }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // create a new department
    this.routes.post(
      "/",
      validateData("create"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .create(req.body)
          .then((department) =>
            res
              .status(200)
              .json({ message: create.success.create, data: department }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update an existing department
    this.routes.put(
      "/:id",
      validateData("update"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .update(req.params.id!, req.body)
          .then((department) =>
            res.status(200).json({ message: update.success, data: department }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // delete a department
    this.routes.delete(
      "/:id",
      validateData("delete"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .delete(req.params.id!)
          .then(() =>
            res.status(204).send({ message: deleteDepartment.success }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // get all department members
    this.routes.get(
      "/:id/members",
      validateData("get"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .getMembers(req.params.id!)
          .then((members) =>
            res
              .status(200)
              .json({ message: get_members.success.fetch, data: members }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // add a member to a department
    this.routes.post(
      "/:id/members",
      validateData("addMember"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .addMember(req.params.id!, req.body)
          .then((member) =>
            res
              .status(200)
              .json({ message: add_member.success.add, data: member }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // remove a member from a department
    this.routes.delete(
      "/:id/members",
      validateData("removeMember"),
      (req, res) => {
        this.departmentController
          .removeMember(req.params.id!, req.body)
          .then(() =>
            res.status(204).send({ message: remove_member.success.remove }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // get all department validators
    this.routes.get(
      "/:id/validators",
      validateData("get"),
      requireRole("USER"),
      (req, res) => {
        this.departmentController
          .getValidators(req.params.id!)
          .then((validators) =>
            res.status(200).json({
              message: get_validators.success.fetch,
              data: validators,
            }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // add a validator to a department
    this.routes.post(
      "/:id/validators",
      validateData("addValidator"),
      (req, res) => {
        this.departmentController
          .addValidator(req.params.id!, req.body)
          .then((member) =>
            res
              .status(200)
              .json({ message: add_validator.success.add, data: member }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // remove a validator from a department
    this.routes.delete(
      "/:id/validators",
      validateData("removeValidator"),
      (req, res) => {
        this.departmentController
          .removeValidator(req.params.id!, req.body)
          .then(() =>
            res.status(204).send({ message: remove_validator.success.remove }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // add a department final validators
    this.routes.post(
      "/:id/final-validators",
      validateData("addFinalValidator"),
      (req, res) => {
        this.departmentController
          .addFinalValidator(req.params.id!, req.body)
          .then((member) =>
            res
              .status(200)
              .json({ message: add_final_validator.success.add, data: member }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    this.routes.get(
      "/:id/final-validators",
      validateData("get"),
      (req, res) => {
        this.departmentController
          .getFinalValidators(req.params.id!)
          .then((validators) =>
            res.status(200).json({
              message: get_final_validators.success.fetch,
              data: validators,
            }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // remove a department final validators
    this.routes.delete(
      "/:id/final-validators",
      validateData("removeFinalValidator"),
      (req, res) => {
        this.departmentController
          .removeFinalValidator(req.params.id!, req.body)
          .then(() =>
            res
              .status(204)
              .send({ message: remove_final_validator.success.remove }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // set department chief
    this.routes.post(
      "/:id/chief",
      validateData("setDepartmentChief"),
      (req, res) => {
        this.departmentController
          .setDepartmentChief(req.params.id!, req.body)
          .then((member) =>
            res.status(200).json({
              message: set_department_chief.success.set,
              data: member,
            }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // unset department chief
    this.routes.delete(
      "/:id/chief",
      validateData("setDepartmentChief"),
      (req, res) => {
        this.departmentController
          .unSetDepartmentChief(req.params.id!, req.body)
          .then((member) =>
            res.status(200).json({
              message: unset_department_chief.success.chief,
              data: member,
            }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );
  }
}
