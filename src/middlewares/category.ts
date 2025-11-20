import { Request, Response, NextFunction } from "express";
import Joi from "joi";

// Category validation schemas
const categoryCreate = Joi.object({
  label: Joi.string().required(),
  parentId: Joi.number().allow(null).required(),
  isSpecial: Joi.boolean().required(),
});

const categoryUpdate = Joi.object({
  label: Joi.string().optional(),
  parentId: Joi.number().allow(null).optional(),
  isSpecial: Joi.boolean().optional(),
});

const categoryParam = Joi.object({
  id: Joi.number().required(),
});

const categoryDelete = Joi.object({
  id: Joi.number().required(),
});

const categoryStructure = Joi.object({
  id: Joi.number().required(),
  label: Joi.string().required(),
  parentId: Joi.number().allow(null).required(),
  isSpecial: Joi.boolean().required(),
});

// validate data for category routes
export const validateCategory = (
  schema: "create" | "update" | "delete" | "get" | "validate"
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
        result = categoryCreate.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      case "get":
        params = categoryParam.validate({ id: req.params.id });
        if (params.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      case "update":
        result = categoryUpdate.validate(req.body, { abortEarly: false });
        params = categoryParam.validate({ id: req.params.id });
        if (result.error || params.error) {
          res.status(400).json({
            error: {
              body: result.error?.details,
              params: params.error?.details,
            },
          });
        } else {
          next();
        }
        break;

      case "delete":
        params = categoryDelete.validate({ id: req.params.id });
        if (params.error) {
          res.status(400).json({ error: params.error?.details });
        } else {
          next();
        }
        break;

      case "validate":
        result = categoryStructure.validate(req.body, { abortEarly: false });
        if (result.error) {
          res.status(400).json({ error: result.error.details });
        } else {
          next();
        }
        break;

      default:
        res.status(400).json({ error: "Invalid validation schema" });
        break;
    }
  };
};

// Export category schemas for external use
export {
  categoryCreate,
  categoryUpdate,
  categoryParam,
  categoryDelete,
  categoryStructure,
};
