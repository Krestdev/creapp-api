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
    @Body() data: Omit<Payment, "proof"> & { proof: string }
  ): Promise<Payment> {
    const { proof, ...paymentData } = data;
    console.log("paymentData", paymentData);
    const payment: Payment & { proof: string } = {
      ...paymentData,
      deadline: paymentData.deadline ? new Date(paymentData.deadline) : null,
      price: Number(paymentData.price),
      userId: Number(paymentData.userId),
      commandId: Number(paymentData.commandId),
      proof,
    };
    return cmdRequestService.create(payment);
  }

  @Post("/depense")
  createDepense(
    @Body()
    data: Omit<Payment, "proof"> & { justification: MyFile | null } & {
      proof: MyFile | null;
    }
  ): Promise<Payment> {
    const { proof, justification, ...paymentData } = data;
    const payment: Payment = {
      ...paymentData,
      deadline: paymentData.deadline ? new Date(paymentData.deadline) : null,
      price: Number(paymentData.price),
      userId: Number(paymentData.userId),
      commandId: Number(paymentData.commandId),
      benefId: Number(paymentData.benefId),
      isPartial: false,
      proof: null,
      justification: null,
    };

    if (proof) {
      console.log("proof", proof);
      payment.proof = proof.map((p) => p.filename).join(";");
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    return cmdRequestService.createDepense(payment);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: Omit<Payment, "proof"> & { justification: string }
  ): Promise<Payment> {
    const { justification, ...paymentData } = data;
    const payment: Omit<Payment, "proof"> & { justification: string } = {
      ...paymentData,
      deadline: paymentData.deadline ? new Date(paymentData.deadline) : null,
      price: Number(paymentData.price),
      userId: Number(paymentData.userId),
      commandId: Number(paymentData.commandId),
      justification,
    };

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
