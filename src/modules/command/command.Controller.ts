import { Command } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { CommandService } from "./command.Service";
import { normalizeFile } from "../../utils/serverUtils";

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
      conditions: number[];
    },
  ): Promise<Command> {
    return commandService.create(data.command, data.ids, data.conditions);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: Command & { conditions: number[] },
  ): Promise<Command> {
    const { conditions, ...command } = data;
    return commandService.update(Number(id), command, conditions);
  }

  @Put("addFile/{id}")
  signedFile(
    @Path() id: string,
    @Body()
    data: {
      proof: Express.Multer.File[] | null;
    },
  ): Promise<Command> {
    return commandService.addSignedFile(
      Number(id),
      normalizeFile(data.proof),
      data.proof,
    );
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
