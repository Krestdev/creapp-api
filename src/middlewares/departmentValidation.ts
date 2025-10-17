import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const department = Joi.object({
  label: Joi.string().required(),
  description: Joi.string().allow(""),
});

const departmentUpdate = Joi.object({
  label: Joi.string(),
  description: Joi.string().allow(""),
});

const departmentParam = Joi.object({
  id: Joi.number().required(),
});

const departmentDelete = Joi.object({
  id: Joi.number().required(),
});

const createMember = Joi.object({
  label: Joi.string().required(),
  // departmentId: Joi.number().required(),
  userId: Joi.number().required(),
  validator: Joi.boolean().optional(),
  chief: Joi.boolean().optional(),
  finalValidator: Joi.boolean().optional(),
});

const removeMember = Joi.object({
  label: Joi.string().optional(),
  // departmentId: Joi.number().optional(),
  userId: Joi.number().optional(),
  validator: Joi.boolean().optional(),
  chief: Joi.boolean().optional(),
  finalValidator: Joi.boolean().optional(),
});

const addValidator = Joi.object({
  // departmentId: Joi.number().required(),
  userId: Joi.number().required(),
});

const removeValidator = Joi.object({
  // departmentId: Joi.number().required(),
  userId: Joi.number().required(),
});

const addFinalValidator = Joi.object({
  // departmentId: Joi.number().required(),
  userId: Joi.number().required(),
});

const removeFinalValidator = Joi.object({
  // departmentId: Joi.number().required(),
  userId: Joi.number().required(),
});

const setDepartmentChief = Joi.object({
  // departmentId: Joi.number().required(),
  userId: Joi.number().required(),
});

// validate date for the department routes
export const validateData = (
  schema:
    | "create"
    | "update"
    | "delete"
    | "get"
    | "addMember"
    | "removeMember"
    | "addValidator"
    | "removeValidator"
    | "addFinalValidator"
    | "removeFinalValidator"
    | "setDepartmentChief"
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let result: Joi.ValidationResult | null = null;
    let params: Joi.ValidationResult | null = null;

    switch (schema) {
      case "create":
        result = department.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "get":
        params = departmentParam.validate({ id: req.params.id });
        if (params.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      case "update":
        result = departmentUpdate.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details && params.error?.details });
        } else {
          next();
        }
        break;

      case "delete":
        result = departmentDelete.validate({ id: req.params.id });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "addMember":
        result = createMember.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      case "removeMember":
        result = removeMember.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      case "addValidator":
        result = addValidator.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      case "removeValidator":
        result = removeValidator.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      case "addFinalValidator":
        result = addFinalValidator.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      case "removeFinalValidator":
        result = removeFinalValidator.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      case "setDepartmentChief":
        result = setDepartmentChief.validate(req.body, { abortEarly: false });
        params = departmentParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details, ...params.error?.details });
        } else {
          next();
        }
        break;

      default:
        break;
    }
  };
};
