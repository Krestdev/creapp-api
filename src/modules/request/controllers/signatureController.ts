import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { SignatureService } from "../services/signatureService";
import { Signature } from "@prisma/client";

const signatureService = new SignatureService();

@Route("request/signature")
@Tags("Signature Routes")
export default class SignatureController {
  @Post("/")
  create(@Body() data: Signature): Promise<Signature> {
    return signatureService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Signature): Promise<Signature> {
    return signatureService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Signature> {
    return signatureService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Signature> {
    return signatureService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Signature[]> {
    return signatureService.getAll();
  }
}
