import { Router } from "express";
import authMessages from "../../assets/messages/authMessages.json";
import AuthController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";

const { login, refresh, logout } = authMessages;

export default class AuthRoute {
  routes: Router = Router();
  authController = new AuthController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate);
    // login
    this.routes.post("/login", requireRole("USER"), (req, res) => {
      this.authController
        .login(req.body)
        .then((result) =>
          res.status(200).json({ message: login.success.login, data: result }),
        )
        .catch((error) =>
          res
            .status(401)
            .json({ error: error.message || login.error.invalid_credentials }),
        );
    });

    // refresh
    this.routes.post("/refresh", requireRole("USER"), (req, res) => {
      this.authController
        .refresh(req.body)
        .then((result) =>
          res
            .status(200)
            .json({ message: refresh.success.refresh, data: result }),
        )
        .catch((error) =>
          res
            .status(401)
            .json({ error: error.message || refresh.error.invalid_token }),
        );
    });

    // logout
    this.routes.post(
      "/logout",
      authenticate,
      requireRole("USER"),
      (req, res) => {
        this.authController
          .logout()
          .then((result) =>
            res
              .status(200)
              .json({ message: logout.success.logout, data: result }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );
  }
}
