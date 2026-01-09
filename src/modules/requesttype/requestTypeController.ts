import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { RequestTypeService } from "./requestTypeService";
import { RequestType } from "@prisma/client";

const cmdRequestService = new RequestTypeService();

@Route("request/requestType")
@Tags("RequestType Routes")
export default class RequestTypeController {
  @Post("/")
  create(@Body() data: RequestType): Promise<RequestType> {
    return cmdRequestService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: RequestType): Promise<RequestType> {
    return cmdRequestService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<RequestType> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<RequestType> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<RequestType[]> {
    return cmdRequestService.getAll();
  }
}
