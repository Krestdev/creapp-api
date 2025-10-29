import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { user } from "../../../../assets/messages/userMessages.json";

const userService = new UserService();

const {
  register,
  update_profile,
  all_users,
  get_user_by_id,
  // profile,
  delete_account,
  login,
} = user;

export default class UserController {
  create = (req: Request, res: Response) => {
    userService
      .create(req.body)
      .then((user) =>
        res.status(201).json({ message: register.success.register, data: user })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  login = (req: Request, res: Response) => {
    userService
      .login(req.body)
      .then((user) =>
        res.status(200).json({ message: login.success.login, data: user })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  verify = (req: Request<{ otp: string }>, res: Response) => {
    const { otp } = req.params;
    const { email } = req.query;
    userService
      .verifyAccount(email as string, otp)
      .then((isValid) => {
        if (isValid) {
          return res
            .status(200)
            .json({ message: "Account verified successfully" });
        }
        return res.status(400).json({ error: "Invalid OTP or email" });
      })
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  update = (req: Request<{ id: string }>, res: Response) => {
    userService
      .update(Number(req.params.id), req.body)
      .then((user) =>
        res
          .status(200)
          .json({ message: update_profile.success.update, data: user })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  delete = (req: Request<{ id: string }>, res: Response) => {
    userService
      .delete(Number(req.params.id))
      .then(() =>
        res.status(204).send({ message: delete_account.success.delete })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getAll = (req: Request, res: Response) => {
    userService
      .getAll()
      .then((users) =>
        res.status(200).json({ message: all_users.success.list, data: users })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getOne = (req: Request<{ id: string }>, res: Response) => {
    userService
      .getOne(Number(req.params.id))
      .then((user) =>
        res
          .status(200)
          .json({ message: get_user_by_id.success.details, data: user })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
}
