import { PayType } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PayTypeService } from "./payTypeService";

const payTypeService = new PayTypeService();

@Route("request/payType")
@Tags("PaymentType Routes")
export default class PayTypeController {
  @Post("/")
  create(
    @Body() data: PayType & { bankId: number; payTypeId: number }
  ): Promise<PayType> {
    return payTypeService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: PayType & { bankId: number; payTypeId: number }
  ): Promise<PayType> {
    return payTypeService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<PayType> {
    return payTypeService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<PayType> {
    return payTypeService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<PayType[]> {
    return payTypeService.getAll();
  }
}
