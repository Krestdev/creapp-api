import { Validator } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ValidatorService } from "./validator.Service";

const validatorService = new ValidatorService();

@Route("request")
@Tags("Validator Routes")
export default class ValidatorController {
  @Get("/validator/{id}")
  getValidatorByCategory(@Path() id: string): Promise<Validator[]> {
    return validatorService.getValidatorByCategory(Number(id));
  }

  @Put("/validator/{id}")
  updateOneValidator(
    @Path() id: string,
    @Body() data: Validator,
  ): Promise<Validator> {
    return validatorService.updateValidator(Number(id), data);
  }

  @Post("/validator/{id}")
  createValidator(
    @Path() id: number,
    @Body() data: Validator,
  ): Promise<Validator> {
    return validatorService.addValidatorToCategory(id, data);
  }

  @Delete("/validator/{id}")
  deleteValidator(@Path() id: string): Promise<Validator> {
    return validatorService.removeValidatorFromCategory(Number(id));
  }
}
