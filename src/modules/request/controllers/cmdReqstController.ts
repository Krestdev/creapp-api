import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { CommandRequestService } from "../services/cmdReqstService";
import { CommandRequest } from "@prisma/client";

const cmdRequestService = new CommandRequestService();

@Route("request/cmdrqst")
@Tags("Command request Routes")
export default class CmdRequestController {
  @Post("/")
  create(
    @Body() data: CommandRequest & { requests: number[] }
  ): Promise<CommandRequest> {
    const { requests, ...ndata } = data;
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
    return cmdRequestService.update(Number(id), ndata, requests);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<CommandRequest> {
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

  @Put("/validate/{id}")
  validate(@Path() id: string): Promise<CommandRequest> {
    return cmdRequestService.validate(Number(id));
  }

  @Put("/reject/{id}")
  reject(@Path() id: string): Promise<CommandRequest> {
    return cmdRequestService.reject(Number(id));
  }

  @Put("/attachDoc/{id}/{docId}")
  attachDoc(
    @Path() id: string,
    @Path() docId: string
  ): Promise<CommandRequest> {
    return cmdRequestService.attachDoc(Number(id), Number(docId));
  }

  @Put("/submit/{id}")
  submit(@Path() id: string): Promise<CommandRequest> {
    return cmdRequestService.submit(Number(id));
  }

  @Put("/linkProvider/{id}/{providerId}")
  linkProvider(
    @Path() id: string,
    @Path() providerId: string
  ): Promise<CommandRequest> {
    return cmdRequestService.linkProvider(Number(id), Number(providerId));
  }
}
