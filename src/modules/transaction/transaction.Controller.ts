import { Bank, Transaction } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { TransactionService } from "./transaction.Service";
import { getIO } from "../../socket";
import { normalizeFile } from "../../utils/serverUtils";

const transactionService = new TransactionService();

@Route("request/transaction")
@Tags("Transactioning Routes")
export default class TransactionController {
  @Post("/createDebitCredit")
  createCreditTransaction(
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

    const newTransaction: Transaction & { from: Bank } = {
      ...restData,
      amount: Number(data.amount),
      date: new Date(data.date ?? "now"),
      proof: null,
      status: data.status,
      Type: data.Type === "undefined" ? "DEBIT" : data.Type,
      methodId: methodId ? Number(methodId) : null,
      from: JSON.parse(data.from as unknown as string),
    };

    if (data.userId) {
      newTransaction.userId = Number(data.userId);
    }

    if (proof) {
      newTransaction.proof = normalizeFile(proof);
    }

    return transactionService.createCreditTransaction(
      {
        ...newTransaction,
      },
      proof,
    );
  }

  @Post("/createDebitTransaction")
  createDebitTransaction(
    @Body()
    data: Omit<Transaction, "proof"> & {
      proof: Express.Multer.File[] | null;
    } & {
      fromBankId: number;
      to?: Bank;
      paymentId: number;
      methodId: number | null;
      status: string;
    },
  ): Promise<Transaction> {
    const { proof, paymentId, status, methodId, fromBankId, ...restData } =
      data;

    const newTransaction: Transaction & { to: Bank } = {
      ...restData,
      amount: Number(data.amount),
      date: new Date(data.date ?? "now"),
      proof: null,
      status: data.status,
      Type: data.Type === "undefined" ? "DEBIT" : data.Type,
      methodId: methodId ? Number(methodId) : null,
      to: JSON.parse(data.to as unknown as string),
      fromBankId: Number(fromBankId),
    };

    if (data.userId) {
      newTransaction.userId = Number(data.userId);
    }

    if (proof) {
      newTransaction.proof = normalizeFile(proof);
    }

    return transactionService.createDebitTransaction(
      {
        ...newTransaction,
      },
      proof,
    );
  }

  @Post("/createDebitPayment")
  createDebitPayment(
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

    const newTransaction: Transaction & { to: Bank } = {
      ...restData,
      amount: Number(data.amount),
      date: new Date(data.date ?? "now"),
      proof: null,
      status: data.status,
      Type: data.Type === "undefined" ? "DEBIT" : data.Type,
      methodId: methodId ? Number(methodId) : null,
      to: JSON.parse(data.to as unknown as string),
      userId: Number(data.userId),
    };

    if (proof) {
      newTransaction.proof = normalizeFile(proof);
    }

    return transactionService.createPaymentTransaction(
      {
        ...newTransaction,
        paymentId: Number(paymentId),
      },
      proof,
    );
  }

  @Post("/createTransfer")
  createTransfer(
    @Body()
    data: Transaction,
  ): Promise<Transaction> {
    const { status, methodId, ...restData } = data;

    return transactionService.createTransfer({
      ...data,
    });
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  updateTransfer(
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

    if (data.fromBankId) {
      newTransaction.fromBankId = Number(data.fromBankId);
    }

    if (data.toBankId) {
      newTransaction.toBankId = Number(data.toBankId);
    }

    console.log(data, newTransaction);

    return transactionService.updateTransfer(Number(id), newTransaction, proof);
  }

  @Put("/{id}")
  updatePayment(
    @Path() id: string,
    @Body()
    data: Omit<Transaction, "proof"> & {
      proof: Express.Multer.File[] | null;
      paymentId: number | null;
    },
  ): Promise<Transaction> {
    const { proof, paymentId, ...restData } = data;

    return transactionService.updatePayment(
      Number(id),
      normalizeFile(proof),
      Number(paymentId),
      proof,
    );
  }

  @Put("/{id}")
  completeTransfer(
    @Path() id: string,
    @Body()
    data: Omit<Transaction, "proof"> & {
      proof: Express.Multer.File[] | null;
      paymentId: number | null;
      date: string;
    },
  ): Promise<Transaction> {
    const { proof, paymentId, date, ...restData } = data;

    return transactionService.completeTransfer(
      Number(id),
      normalizeFile(proof),
      new Date(date).toISOString(),
      proof,
    );
  }

  @Put("/{id}")
  updateSign(
    @Path() id: string,
    @Body()
    data: Transaction,
  ): Promise<Transaction> {
    return transactionService.updateSign(Number(id), data);
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

  @Post("/appro")
  createApprovisionement(
    @Body()
    data: Omit<Transaction, "proof"> & {
      from: Bank;
      to?: Bank;
      paymentId: number;
      methodId: number | null;
      status: string;
      payments: number[];
    },
  ): Promise<Transaction> {
    const { paymentId, status, methodId } = data;

    return transactionService.createApprovisionement({
      ...data,
      paymentId: Number(paymentId),
      methodId: methodId ? Number(methodId) : null,
      status: status,
      proof: null,
    });
  }
}
