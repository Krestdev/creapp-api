import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ReceptionService } from "./receptionService";
import { Reception } from "@prisma/client";

const receptionService = new ReceptionService();

@Route("request/reception")
@Tags("Reception Routes")
export default class ReceptionController {
  @Post("/")
  create(@Body() data: Reception): Promise<Reception> {
    return receptionService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Reception): Promise<Reception> {
    return receptionService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Reception> {
    return receptionService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Reception> {
    return receptionService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Reception[]> {
    return receptionService.getAll();
  }
}
