import { RequestModel } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { RequestService } from "../services/requestService";

const requestService = new RequestService();

@Route("request/object")
@Tags("Request Routes")
export default class RequestController {
  /**
   * @summary Creates a user request
   */
  @Post("/")
  create(
    @Body() data: Omit<RequestModel, "createdAt" | "updatedAt">
  ): Promise<RequestModel> {
    return requestService.create(data);
  }

  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: RequestModel
  ): Promise<RequestModel> {
    return requestService.update(Number(id), data);
  }

  @Get("/")
  getAll(): Promise<RequestModel[]> {
    return requestService.getAll();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<RequestModel | null> {
    return requestService.getOne(Number(id));
  }

  @Get("/mine/{id}")
  getMine(@Path() id: string): Promise<RequestModel[]> {
    // needs user Id
    return requestService.getMine(Number(id));
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<RequestModel | null> {
    return requestService.delete(Number(id));
  }

  @Put("/validate/{id}")
  validate(@Path() id: string): Promise<RequestModel> {
    return requestService.validate(Number(id));
  }

  @Put("/reject/{id}")
  reject(@Path() id: string): Promise<RequestModel> {
    return requestService.reject(Number(id));
  }

  @Put("/priority/{id}")
  priority(
    @Path() id: string,
    @Body() data: { priority: string }
  ): Promise<RequestModel> {
    return requestService.priority(Number(id), data.priority);
  }

  @Put("/submit/{id}")
  submit(@Path() id: string): Promise<RequestModel> {
    return requestService.submit(Number(id));
  }
}
