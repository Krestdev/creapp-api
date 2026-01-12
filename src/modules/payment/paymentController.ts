import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PaymentService } from "./paymentService";
import { Payment } from "@prisma/client";
import { MyFile } from "../reception/receptionController";

const cmdRequestService = new PaymentService();

@Route("request/payment")
@Tags("Payment Routes")
export default class CmdRequestController {
  @Post("/")
  create(
    @Body()
    data: Omit<Payment, "proof" | "justification"> & {
      proof: Express.Multer.File[] | null;
      justification: Express.Multer.File[] | null;
    }
  ): Promise<Payment> {
    const { proof, justification, ...paymentData } = data;
    const payment: Payment = {
      ...paymentData,
      deadline: paymentData.deadline ? new Date(paymentData.deadline) : null,
      price: Number(paymentData.price),
      userId: Number(paymentData.userId),
      commandId: Number(paymentData.commandId),
      proof: null,
      justification: null,
    };

    if (proof) {
      payment.proof = proof.map((p) => p.filename).join(";");
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    return cmdRequestService.create(payment, proof);
  }

  @Post("/depense")
  createDepense(
    @Body()
    data: Omit<Payment, "proof"> & { justification: MyFile | null } & {
      proof: MyFile | null;
    } & { caisseId: number }
  ): Promise<Payment> {
    const { proof, justification, caisseId, ...paymentData } = data;
    const payment: Payment = {
      ...paymentData,
      deadline: paymentData.deadline ? new Date(paymentData.deadline) : null,
      price: Number(paymentData.price),
      userId: Number(paymentData.userId),
      commandId: Number(paymentData.commandId),
      benefId: Number(paymentData.benefId),
      vehiclesId: Number(paymentData.vehiclesId),
      isPartial: false,
      proof: null,
      justification: null,
    };

    if (proof) {
      payment.proof = proof.map((p) => p.filename).join(";");
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    if (caisseId) {
      payment.bankId = Number(caisseId);
    }

    return cmdRequestService.createDepense(payment);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Partial<Omit<Payment, "proof">> & {
      justification: Express.Multer.File[] | null;
      proof: Express.Multer.File[] | null;
    }
  ): Promise<Payment> {
    const { justification, proof, ...paymentData } = data;
    const payment: Partial<Payment> = {
      ...paymentData,
    };

    if (paymentData.deadline) {
      payment.deadline = paymentData.deadline
        ? new Date(paymentData.deadline)
        : null;
    }
    if (paymentData.price) {
      payment.price = Number(paymentData.price);
    }
    if (paymentData.userId) {
      payment.userId = Number(paymentData.userId);
    }
    if (paymentData.commandId) {
      payment.commandId = Number(paymentData.commandId);
    }

    if (proof) {
      payment.proof = proof.map((p) => p.filename).join(";");
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    return cmdRequestService.update(Number(id), payment);
  }

  /**
   * @summary Update Command request
   */
  @Put("validate/{id}")
  validate(@Path() id: string, @Body() data: Payment): Promise<Payment> {
    return cmdRequestService.validate(Number(id), data);
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
