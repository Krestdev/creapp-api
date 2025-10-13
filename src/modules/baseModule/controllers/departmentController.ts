import { Request, Response } from "express";
import { DepartmentService } from "../services/departmentService";
import { department } from "../../../../assets/messages/departmentMessages.json";

const departmentService = new DepartmentService();

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
  set_department_chief,
} = department;

export default class DepartmentController {
  create = (req: Request, res: Response) => {
    departmentService
      .create(req.body)
      .then((department) =>
        res
          .status(201)
          .json({ message: create.success.create, data: department })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  update = (req: Request<{ id: string }>, res: Response) => {
    departmentService
      .update(Number(req.params.id), req.body)
      .then((department) =>
        res.status(200).json({ message: update.success, data: department })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  delete = (req: Request<{ id: string }>, res: Response) => {
    departmentService
      .delete(Number(req.params.id))
      .then(() => res.status(204).send({ message: deleteDepartment.success }))
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getAll = (req: Request, res: Response) => {
    departmentService
      .getAll()
      .then((departments) =>
        res
          .status(200)
          .json({ message: get_all.success.fetch, data: departments })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getOne = (req: Request<{ id: string }>, res: Response) => {
    departmentService
      .getOne(Number(req.params.id))
      .then((department) =>
        res
          .status(200)
          .json({ message: get_one.success.fetch, data: department })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
  getMembers = (req: Request<{ id: string }>, res: Response) => {
    departmentService
      .getMembers(Number(req.params.id))
      .then((members) =>
        res
          .status(200)
          .json({ message: get_members.success.fetch, data: members })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  addMember = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .addFinalValidator(departmentId, userId)
      .then((member) =>
        res.status(200).json({ message: add_member.success.add, data: member })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  removeMember = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .removeMember(departmentId, userId)
      .then(() =>
        res.status(204).send({ message: remove_member.success.remove })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  getValidators = (req: Request<{ id: string }>, res: Response) => {
    departmentService
      .getValidators(Number(req.params.id))
      .then((validators) =>
        res
          .status(200)
          .json({ message: get_validators.success.fetch, data: validators })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  removeValidator = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .removeValidator(departmentId, userId)
      .then(() =>
        res.status(204).send({ message: remove_validator.success.remove })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  addFinalValidator = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .addFinalValidator(departmentId, userId)
      .then((member) =>
        res
          .status(200)
          .json({ message: add_final_validator.success.add, data: member })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  removeFinalValidator = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .removeFinalValidator(departmentId, userId)
      .then(() =>
        res.status(204).send({ message: remove_final_validator.success.remove })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  addValidator = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .addValidator(departmentId, userId)
      .then((member) =>
        res
          .status(200)
          .json({ message: add_validator.success.add, data: member })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };

  setDepartmentChief = (req: Request, res: Response) => {
    const { departmentId, userId } = req.body;
    departmentService
      .setDepartmentChief(departmentId, userId)
      .then((member) =>
        res
          .status(200)
          .json({ message: set_department_chief.success.set, data: member })
      )
      .catch((error) => res.status(400).json({ error: error.message }));
  };
}
