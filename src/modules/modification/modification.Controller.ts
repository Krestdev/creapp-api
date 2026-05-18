import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ModificationService } from "./modification.Service";
import { modification } from "@prisma/client";

const modificationService = new ModificationService();

@Route("request/modification")
@Tags("modification Routes")
export default class ModificationController {
  @Post("/")
  create(@Body() data: modification): Promise<modification> {
    return modificationService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: modification,
  ): Promise<modification> {
    return modificationService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<modification> {
    return modificationService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<modification> {
    return modificationService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<modification[]> {
    return modificationService.getAll();
  }

  @Get("/me/{id}")
  getMymodifications(@Path() id: number): Promise<modification[]> {
    return modificationService.getMyNotif(id);
  }
}
