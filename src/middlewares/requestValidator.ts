import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const request = Joi.object({
  label: Joi.string().required(),
  description: Joi.string().allow(""),
  quatity: Joi.number(),
  dueDate: Joi.date(),
  unit: Joi.string(),
  benficiary: Joi.string(),
  state: Joi.string(),
  priority: Joi.string(),
  UserId: Joi.number(),
  categoryId: Joi.number(),
});

// const requestUpdatePriority = Joi.object({
//   priority: Joi.string(),
// });

// const requestUpdateQuantity = Joi.object({
//   quantity: Joi.number(),
// });

// const requestUpdateDueDate = Joi.object({
//   dueDate: Joi.date(),
// });

const requestUpdate = Joi.object({
  label: Joi.string().required(),
  description: Joi.string().allow(""),
  unit: Joi.string(),
  benficiary: Joi.string(),
  state: Joi.string(),
  UserId: Joi.number(),
  categoryId: Joi.number(),
});

const requestParam = Joi.object({
  id: Joi.number().required(),
});

// const requestDelete = Joi.object({
//   id: Joi.number().required(),
// });

// validate date for the department routes
export const validateData = (
  schema: "create" | "get" | "update" | "updatePriority"
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
        result = request.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "get":
        params = requestParam.validate({ id: req.params.id });
        if (params.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      case "update":
        params = requestParam.validate({ id: req.params.id });
        result = requestUpdate.validate(req.body);
        if (params.error || result.error) {
          res
            .status(400)
            .json({ error: params.error?.details, ...result.error?.details });
        } else {
          next();
        }
        break;

      case "updatePriority":
        params = requestParam.validate({ id: req.params.id });
        result = requestUpdate.validate(req.body, { abortEarly: false });
        if (params.error || result.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      default:
        break;
    }
  };
};
