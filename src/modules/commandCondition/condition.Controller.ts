import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { CommandConditionsService } from "./condition.Service";
import { CommandConditions } from "@prisma/client";

const cmdRequestService = new CommandConditionsService();

@Route("request/notification")
@Tags("CommandConditions Routes")
export default class CommandConditionsController {
  @Post("/")
  create(@Body() data: CommandConditions): Promise<CommandConditions> {
    return cmdRequestService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: CommandConditions,
  ): Promise<CommandConditions> {
    return cmdRequestService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<CommandConditions> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<CommandConditions> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<CommandConditions[]> {
    return cmdRequestService.getAll();
  }
}
