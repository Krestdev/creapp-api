import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { AccountingService } from "./accounting.Service";
import { Accounting } from "@prisma/client";

const accountingService = new AccountingService();

@Route("request/accounting")
@Tags("Accounting Routes")
export default class AccountingController {
  @Post("/")
  create(@Body() data: Accounting): Promise<Accounting> {
    return accountingService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Accounting): Promise<Accounting> {
    return accountingService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Accounting> {
    return accountingService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Accounting> {
    return accountingService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Accounting[]> {
    return accountingService.getAll();
  }
}
