import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PaymentTicketService } from "../services/paymentTicketService";
import { PaymentTicket } from "@prisma/client";

const cmdRequestService = new PaymentTicketService();

@Route("request/paymentTicket")
@Tags("PaymentTicket Routes")
export default class CmdRequestController {
  @Post("/")
  create(@Body() data: PaymentTicket): Promise<PaymentTicket> {
    return cmdRequestService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: PaymentTicket
  ): Promise<PaymentTicket> {
    return cmdRequestService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<PaymentTicket> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<PaymentTicket> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<PaymentTicket[]> {
    return cmdRequestService.getAll();
  }
}
