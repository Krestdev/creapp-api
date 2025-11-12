import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ProviderService } from "../services/providerService";
import { Provider } from "@prisma/client";

const cmdRequestService = new ProviderService();

@Route("request/provider")
@Tags("Provider Routes")
export default class CmdRequestController {
  @Post("/")
  create(@Body() data: Provider): Promise<Provider> {
    return cmdRequestService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Provider): Promise<Provider> {
    return cmdRequestService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Provider> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Provider> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Provider[]> {
    return cmdRequestService.getAll();
  }
}
