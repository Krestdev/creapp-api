import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { BankService } from "./bank.Service";
import { Bank } from "@prisma/client";
import { getIO } from "../../socket";

const bankService = new BankService();

@Route("request/bank")
@Tags("Banking Routes")
export default class BankController {
  @Post("/")
  create(
    @Body()
    data: Omit<Bank, "justification"> & {
      justification: Express.Multer.File[];
    },
  ): Promise<Bank> {
    const { justification, ...restData } = data;

    const newBank = {
      ...restData,
      balance: Number(data.balance),
      Status: (data.Status as unknown as string) == "true" ? true : false,
    };
    const newJustification = justification.map((p) => p.filename).join(";");

    getIO().emit("bank:new");
    return bankService.create(
      { ...newBank, justification: newJustification },
      justification,
    );
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Omit<Bank, "justification"> & {
      justification: Express.Multer.File[] | null;
    },
  ): Promise<Bank> {
    const { justification, ...restData } = data;

    const newBank = {
      ...restData,
      balance: Number(data.balance),
      Status: (data.Status as unknown as string) == "true" ? true : false,
    };
    const newJustification = justification
      ? justification.map((p) => p.filename).join(";")
      : null;

    getIO().emit("bank:update");
    return bankService.update(
      Number(id),
      newBank,
      newJustification,
      justification,
    );
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Bank> {
    getIO().emit("bank:delete");
    return bankService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Bank> {
    return bankService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Bank[]> {
    return bankService.getAll();
  }
}
