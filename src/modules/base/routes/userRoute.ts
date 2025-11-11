import { Router } from "express";
import UserController from "../controllers/userController";
import { validateData } from "../../../middlewares/userValidation";
import { user } from "../../../../assets/messages/userMessages.json";

const {
  register,
  update_profile,
  all_users,
  get_user_by_id,
  // profile,
  delete_account,
  login,
} = user;

export default class UserRouter {
  routes: Router = Router();
  userController: UserController = new UserController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.post("/register", validateData("create"), (req, res) => {
      this.userController
        .create(req.body)
        .then((user) =>
          res
            .status(201)
            .json({ message: register.success.register, data: user })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post("/login", validateData("login"), (req, res) => {
      this.userController
        .login(req.body)
        .then((user) =>
          res.status(200).json({ message: login.success.login, data: user })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/verify/:otp", (req, res) =>
      this.userController
        .verify(req.params.otp, req.query.email?.toString() ?? "none")
        .then((isValid) => {
          if (isValid) {
            return res
              .status(200)
              .json({ message: "Account verified successfully" });
          }
          return res.status(400).json({ error: "Invalid OTP or email" });
        })
        .catch((error) => res.status(400).json({ error: error.message }))
    );

    this.routes.put("/:id", validateData("update"), (req, res) => {
      this.userController
        .update(Number(req.params.id!), req.body)
        .then((user) =>
          res
            .status(200)
            .json({ message: update_profile.success.update, data: user })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/", (req, res) =>
      this.userController
        .getAll()
        .then((users) =>
          res.status(200).json({ message: all_users.success.list, data: users })
        )
        .catch((error) => res.status(400).json({ error: error.message }))
    );

    this.routes.get("/:id", validateData("get"), (req, res) => {
      this.userController
        .getOne(req.params.id!)
        .then((user) =>
          res
            .status(200)
            .json({ message: get_user_by_id.success.details, data: user })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.delete("/:id", validateData("delete"), (req, res) => {
      this.userController
        .delete(req.params.id ?? "0")
        .then(() =>
          res.status(204).send({ message: delete_account.success.delete })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/role/list", (req, res) => {
      this.userController
        .getRoles()
        .then((roles) =>
          res
            .status(200)
            .json({ message: "Roles fetched successfully", data: roles })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post("/role/create", validateData("createRole"), (req, res) => {
      this.userController
        .createRole(req.body)
        .then((role) =>
          res
            .status(200)
            .json({ message: "Role created successfully", data: role })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post("/:id/roles", validateData("addRole"), (req, res) => {
      this.userController
        .addRole(req.params.id!, req.body)
        .then(() =>
          res.status(200).json({ message: "Role added successfully" })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
    this.routes.delete("/:id/roles", validateData("removeRole"), (req, res) => {
      this.userController
        .removeRole(req.params.id!, req.body)
        .then(() =>
          res.status(200).json({ message: "Role removed successfully" })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post(
      "/createRolePages",
      validateData("createRolePages"),
      (req, res) => {
        this.userController
          .createRolePages(req.body)
          .then(() =>
            res.status(201).json({ message: "Role pages created successfully" })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    this.routes.delete(
      "/deleteRolePages",
      validateData("deleteRolePages"),
      (req, res) => {
        this.userController
          .deleteRolePages(req.body)
          .then(() =>
            res.status(200).json({ message: "Role pages deleted successfully" })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );
    this.routes.post(
      "/addPageToRole",
      validateData("addPageToRole"),
      (req, res) => {
        this.userController
          .addPageToRole(req.body)
          .then(() =>
            res.status(200).json({ message: "Page added to role successfully" })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    this.routes.patch(
      "/removePageFromRole",
      validateData("removePageFromRole"),
      (req, res) => {
        this.userController
          .removePageFromRole(req.body)
          .then(() =>
            res
              .status(200)
              .json({ message: "Page removed from role successfully" })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    this.routes.get(
      "/rolePages/:roleId",
      validateData("getRolePages"),
      (req, res) => {
        this.userController
          .getRolePages(req.params.roleId!)
          .then((pages) =>
            res
              .status(200)
              .json({ message: "Role pages fetched successfully", data: pages })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );
  }
}
