import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const user = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().min(9).required(),
});

const userUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).max(100).optional(),
  phone: Joi.string().min(9).optional(),
  role: Joi.string().optional(),
});

const userParam = Joi.object({
  id: Joi.number().required(),
});

const userDelete = Joi.object({
  id: Joi.number().required(),
});

// validate date for the user routes
export const validateData = (
  schema: "create" | "update" | "delete" | "get"
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
        result = user.validate(req.body);
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "get":
        params = userParam.validate({ id: req.params.id });
        if (params.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      case "update":
        result = userUpdate.validate(req.body);
        params = userParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res
            .status(400)
            .json({ error: result.error?.details && params.error?.details });
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

      default:
        break;
    }
  };
};
