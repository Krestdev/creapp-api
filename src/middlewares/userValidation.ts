import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const user = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().min(9).required(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const userUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).max(100).optional(),
  phone: Joi.string().min(9).optional(),
  role: Joi.array().items(Joi.number()),
});

const userParam = Joi.object({
  id: Joi.number().required(),
});

const userDelete = Joi.object({
  id: Joi.number().required(),
});

const userRole = Joi.object({
  roleId: Joi.number().required(),
});

const userCreateRole = Joi.object({
  label: Joi.string().required(),
});

const rolePages = Joi.object({
  pageIds: Joi.array().items(Joi.string()).required(),
});

const rolePageIds = Joi.object({
  rolePageIds: Joi.array().items(Joi.number()).required(),
});

const removePageId = Joi.object({
  pageId: Joi.string().required(),
  roleId: Joi.number().required(),
});

const addPageId = Joi.object({
  rolePageId: Joi.string().required(),
  roleId: Joi.number().required(),
});

// validate date for the user routes
export const validateData = (
  schema:
    | "create"
    | "update"
    | "delete"
    | "get"
    | "login"
    | "addRole"
    | "createRole"
    | "removeRole"
    | "createRolePages"
    | "deleteRolePages"
    | "addPageToRole"
    | "removePageFromRole"
    | "getRolePages"
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
        result = user.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;
      case "login":
        result = login.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "get":
        params = userParam.validate(
          { id: req.params.id },
          { abortEarly: false }
        );
        if (params.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      case "update":
        result = userUpdate.validate(req.body, { abortEarly: false });
        params = userParam.validate(
          { id: req.params.id },
          { abortEarly: false }
        );
        if (result.error || params.error) {
          res
            .status(400)
            .json({
              error: { ...result.error?.details, ...params.error?.details },
            });
        } else {
          next();
        }
        break;

      case "delete":
        result = userDelete.validate({ id: req.params.id });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "addRole":
        result = userRole.validate(req.body);
        params = userParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({
              error: { ...result.error?.details, ...params.error?.details },
            });
        } else {
          next();
        }
        break;

      case "createRole":
        result = userCreateRole.validate(req.body);
        if (result.error) {
          res.status(400).json({ error: result.error?.details });
        } else {
          next();
        }
        break;

      case "removeRole":
        result = userRole.validate(req.body);
        params = userParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({
              error: { ...result.error?.details, ...params.error?.details },
            });
        } else {
          next();
        }
        break;

      case "createRolePages":
        result = rolePages.validate(req.body);
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "deleteRolePages":
        result = rolePageIds.validate(req.body);
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "addPageToRole":
        result = addPageId.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "removePageFromRole":
        result = removePageId.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "getRolePages":
        params = userRole.validate({ roleId: req.params.roleId });
        if (params.error) {
          res.status(400).json({ error: params.error.details });
        } else {
          next();
        }
        break;

      default:
        break;
    }
  };
};
