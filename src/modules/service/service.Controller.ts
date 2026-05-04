import { Services } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ServiceService } from "./service.Service";

const serviceService = new ServiceService();

@Route("request/service")
@Tags("PaymentType Routes")
export default class ServiceController {
  @Post("/")
  create(@Body() data: Services & { users: number[] }): Promise<Services> {
    return serviceService.create(data);
  }
  @Post("/add/{id}")
  addUsers(
    @Path() id: string,
    @Body() data: { users: number[] },
  ): Promise<Services> {
    return serviceService.addUsers(+id, data.users);
  }

  @Post("/remove/{id}")
  removeUser(
    @Path() id: string,
    @Body() data: { users: number[] },
  ): Promise<Services> {
    return serviceService.removeUsers(+id, data.users);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: Services & { bankId: number; serviceId: number },
  ): Promise<Services> {
    return serviceService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Services> {
    return serviceService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Services> {
    return serviceService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Services[]> {
    return serviceService.getAll();
  }
}
