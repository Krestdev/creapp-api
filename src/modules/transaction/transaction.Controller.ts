import { Bank, Transaction } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { TransactionService } from "./transaction.Service";
import { getIO } from "../../socket";
import { normalizeFile } from "../../utils/serverUtils";

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
      status: string;
    },
  ): Promise<Transaction> {
    const { proof, paymentId, status, methodId, ...restData } = data;

    const newTransaction: Transaction & { from: Bank; to?: Bank } = {
      ...restData,
      amount: Number(data.amount),
      date: new Date(data.date ?? "now"),
      proof: null,
      status: data.status,
      Type: data.Type === "undefined" ? "DEBIT" : data.Type,
      methodId: methodId ? Number(methodId) : null,
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
      newTransaction.proof = normalizeFile(proof);
    }

    return transactionService.create(
      {
        ...newTransaction,
        paymentId: Number(paymentId),
        methodId: methodId ? Number(methodId) : null,
        status: status,
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

    const newTransaction: Transaction & { proof: string | null } = {
      ...restData,
      proof: null,
    };

    console.log(data);

    if (data.date) {
      newTransaction.date = new Date(data.date);
    }

    if (data.methodId) {
      newTransaction.methodId = Number(data.methodId);
    }

    if (data.amount) {
      newTransaction.amount = Number(data.amount);
    }

    if (proof) {
      newTransaction.proof = normalizeFile(proof);
    }

    let payId: number | null = null;
    if (paymentId) {
      payId = Number(paymentId);
    }

    return transactionService.update(Number(id), newTransaction, payId, proof);
  }

  /**
   * @summary Update Command request
   */
  @Put("sign/{id}")
  sign(
    @Path() id: string,
    @Body()
    data: Omit<Transaction, "proof"> & {
      signDoc: Express.Multer.File[] | null;
      userId: number;
    },
  ): Promise<Transaction> {
    const { signDoc, userId } = data;

    const newProof = normalizeFile(signDoc);

    getIO().emit("transaction:update");
    return transactionService.sign(Number(id), newProof, userId, signDoc);
  }

  @Put("/validate/{id}")
  validate(
    @Path() id: string,
    @Body()
    data: { validatorId: number; status: string; reason: string },
  ): Promise<Transaction> {
    return transactionService.validate(Number(id), data);
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
