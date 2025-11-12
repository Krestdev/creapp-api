import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PaymentService } from "../services/paymentService";
import { Payment } from "@prisma/client";

const cmdRequestService = new PaymentService();

@Route("request/payment")
@Tags("Payment Routes")
export default class CmdRequestController {
  @Post("/")
  create(@Body() data: Payment): Promise<Payment> {
    return cmdRequestService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Payment): Promise<Payment> {
    return cmdRequestService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Payment> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Payment> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Payment[]> {
    return cmdRequestService.getAll();
  }
}
