import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { CommandService } from "./command.Service";
import { Command } from "@prisma/client";
import { getIO } from "../../socket";

const commandService = new CommandService();

@Route("request/command")
@Tags("Command Routes")
export default class CommandController {
  @Post("/")
  create(
    @Body()
    data: {
      command: Command & {
        instalments: {
          percentage: number;
          deadLine?: string;
          status?: boolean;
        }[];
      };
      ids: number[];
    },
  ): Promise<Command> {
    return commandService.create(data.command, data.ids);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Command): Promise<Command> {
    return commandService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Command> {
    return commandService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Command> {
    return commandService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Command[]> {
    return commandService.getAll();
  }
}
