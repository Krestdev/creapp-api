import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { SpendingService } from "../services/spendingService";
import { Spending } from "@prisma/client";

const spendingService = new SpendingService();

@Route("request/spending")
@Tags("Spending Routes")
export default class SpendingController {
  @Post("/")
  create(@Body() data: Spending): Promise<Spending> {
    return spendingService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Spending): Promise<Spending> {
    return spendingService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Spending> {
    return spendingService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Spending> {
    return spendingService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Spending[]> {
    return spendingService.getAll();
  }
}
