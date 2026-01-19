import { Bank, Transaction } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { TransactionService } from "./transaction.Service";
import { getIO } from "../../socket";

const transactionService = new TransactionService();

@Route("request/transaction")
@Tags("Transactioning Routes")
export default class TransactionController {
  @Post("/")
  create(
    @Body()
    data: Omit<Transaction, "proof"> & {
      proof: Express.Multer.File[] | null;
    } & {
      from: Bank;
      to?: Bank;
      paymentId: number;
      methodId: number | null;
    },
  ): Promise<Transaction> {
    const { proof, paymentId, methodId, ...restData } = data;

    const newTransaction = {
      ...restData,
      amount: Number(data.amount),
      date: new Date(data.date ?? "now"),
      proof: "",
    };

    if (data.from !== undefined) {
      newTransaction.from = JSON.parse(data.from as unknown as string);
    }

    if (data.to !== undefined) {
      newTransaction.to = JSON.parse(data.to as unknown as string);
    }

    if (data.userId) {
      newTransaction.userId = Number(data.userId);
    }

    if (proof) {
      newTransaction.proof = proof.map((p) => p.filename).join(";");
    }

    getIO().emit("transaction:new");
    return transactionService.create(
      {
        ...newTransaction,
        paymentId: Number(paymentId),
        methodId: methodId ? Number(methodId) : null,
      },
      proof,
    );
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Omit<Transaction, "proof"> & {
      proof: Express.Multer.File[] | null;
      paymentId: number | null;
    },
  ): Promise<Transaction> {
    const { proof, paymentId, ...restData } = data;

    const newTransaction = {
      ...restData,
    };

    if (data.date) {
      newTransaction.date = new Date(data.date);
    }

    if (data.amount) {
      newTransaction.amount = Number(data.amount);
    }

    let payId: number | null = null;
    if (paymentId) {
      payId = Number(paymentId);
    }

    const newProof = proof ? proof.map((p) => p.filename).join(";") : null;

    getIO().emit("transaction:update");
    return transactionService.update(
      Number(id),
      newTransaction,
      newProof,
      payId,
      proof,
    );
  }

  @Put("/validate/{id}")
  validate(
    @Path() id: string,
    @Body()
    data: { validatorId: number; status: string; reason: string },
  ): Promise<Transaction> {
    getIO().emit("transaction:update");
    return transactionService.validate(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Transaction> {
    getIO().emit("transaction:delete");
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
