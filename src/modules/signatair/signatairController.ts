import { Signatair } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { SignatairService } from "./signatairService";

const signatairService = new SignatairService();

@Route("request/signatair")
@Tags("Signatair Routes")
export default class SignatairController {
  @Post("/")
  create(@Body() data: Signatair & { userIds: number[] }): Promise<Signatair> {
    return signatairService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: Signatair & { userIds: number[] }
  ): Promise<Signatair> {
    return signatairService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Signatair> {
    return signatairService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Signatair> {
    return signatairService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Signatair[]> {
    return signatairService.getAll();
  }
}
