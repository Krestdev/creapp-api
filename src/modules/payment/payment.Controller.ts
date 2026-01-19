import { Payment } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PaymentService } from "./payment.Service";
import { getIO } from "../../socket";

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
    },
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

    if (data.methodId) {
      payment.methodId = Number(payment.methodId);
    }

    if (proof) {
      payment.proof = proof.map((p) => p.filename).join(";");
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    getIO().emit("payment:new");
    return cmdRequestService.create(payment, proof);
  }

  @Post("/depense")
  createDepense(
    @Body()
    data: Omit<Payment, "proof"> & {
      proof: Express.Multer.File[] | null;
      justification: Express.Multer.File[] | null;
    } & { caisseId: number },
  ): Promise<Payment> {
    const { proof, justification, caisseId, ...paymentData } = data;
    const payment: Payment = {
      ...paymentData,
      deadline: paymentData.deadline ? new Date(paymentData.deadline) : null,
      price: Number(paymentData.price),
      userId: Number(paymentData.userId),
      commandId: Number(paymentData.commandId),
      vehiclesId: Number(paymentData.vehiclesId),
      methodId: Number(paymentData.methodId),
      isPartial: false,
      proof: null,
      justification: null,
    };

    if (paymentData.benefId) {
      payment.benefId = Number(paymentData.benefId);
    }

    if (paymentData.driverId) {
      payment.driverId = Number(paymentData.driverId);
    }

    if (proof) {
      payment.proof = proof.map((p) => p.filename).join(";");
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    if (caisseId) {
      payment.bankId = Number(caisseId);
    }

    getIO().emit("payment:new");
    return cmdRequestService.createDepense(payment, { proof, justification });
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
    },
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

    if (data.methodId) {
      payment.methodId = Number(payment.methodId);
    }

    if (justification) {
      payment.justification = justification.map((p) => p.filename).join(";");
    }

    getIO().emit("payment:update");
    return cmdRequestService.update(Number(id), payment);
  }

  /**
   * @summary Update Command request
   */
  @Put("validate/{id}")
  validate(
    @Path() id: string,
    @Body() data: { userId: number },
  ): Promise<Payment> {
    getIO().emit("payment:update");
    return cmdRequestService.validate(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Payment> {
    getIO().emit("payment:delete");
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
