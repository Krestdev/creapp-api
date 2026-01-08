import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { TransactionService } from "./transactionService";
import { Bank, Transaction } from "@prisma/client";
import { MyFile } from "../reception/receptionController";

const transactionService = new TransactionService();

@Route("request/transaction")
@Tags("Transactioning Routes")
export default class TransactionController {
  @Post("/")
  create(
    @Body()
    data: Omit<Transaction, "proof"> & { proof: MyFile } & {
      from?: Bank;
      to?: Bank;
    }
  ): Promise<Transaction> {
    const { proof, ...restData } = data;

    const newTransaction = {
      ...restData,
      amount: Number(data.amount),
      date: new Date(data.date ?? "now"),
    };

    if (data.from !== undefined) {
      newTransaction.from = JSON.parse(data.from as unknown as string);
    }

    if (data.to !== undefined) {
      newTransaction.to = JSON.parse(data.to as unknown as string);
    }

    const newJustification = proof.map((p) => p.filename).join(";");

    return transactionService.create({
      ...newTransaction,
      proof: newJustification,
    });
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Omit<Transaction, "proof"> & { proof: MyFile | null }
  ): Promise<Transaction> {
    const { proof, ...restData } = data;

    const newTransaction = {
      ...restData,
      amount: Number(data.amount),
    };
    const newProof = proof ? proof.map((p) => p.filename).join(";") : null;

    return transactionService.update(Number(id), newTransaction, newProof);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Transaction> {
    return transactionService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Transaction> {
    return transactionService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Transaction[]> {
    return transactionService.getAll();
  }
}
