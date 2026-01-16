import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { CommandRequestService } from "./cmdReqstService";
import { CommandRequest } from "@prisma/client";
import { getIO } from "../../socket";

const cmdRequestService = new CommandRequestService();

@Route("request/cmdrqst")
@Tags("Command request Routes")
export default class CmdRequestController {
  @Post("/")
  create(
    @Body() data: CommandRequest & { requests: number[] }
  ): Promise<CommandRequest> {
    const { requests, ...ndata } = data;
    getIO().emit("command:new");
    return cmdRequestService.create(ndata, requests);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: CommandRequest & { requests: number[] }
  ): Promise<CommandRequest> {
    const { requests, ...ndata } = data;
    getIO().emit("command:update");
    return cmdRequestService.update(Number(id), ndata, requests);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<CommandRequest> {
    getIO().emit("command:delete");
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<CommandRequest> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<CommandRequest[]> {
    return cmdRequestService.getAll();
  }
}
