import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { TransactionService } from "./transactionService";
import { Transaction } from "@prisma/client";
import { MyFile } from "../reception/receptionController";

const transactionService = new TransactionService();

@Route("request/transaction")
@Tags("Transactioning Routes")
export default class TransactionController {
  @Post("/")
  create(
    @Body()
    data: Omit<Transaction, "proof"> & { proof: MyFile }
  ): Promise<Transaction> {
    const { proof, ...restData } = data;

    const newTransaction = {
      ...restData,
      balance: Number(data.amount),
    };
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
      balance: Number(data.proof),
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
