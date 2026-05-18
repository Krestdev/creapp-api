import { Payment } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Query, Route, Tags } from "tsoa";
import { PaymentService } from "./payment.Service";
import { getIO } from "../../socket";
import { normalizeFile } from "../../utils/serverUtils";

const cmdRequestService = new PaymentService();

export type PaymentQueryOptions = {
  startDate: Date;
  endDate: Date;
  date: string;
  mount: number;
  provider: string;
  type: "deposit" | "expense" | "transport" | "gas" | "";
  excludeType: "deposit" | "expense" | "transport" | "gas" | "";
  priority: string;
  paymentMethod: string;
  matchBeneficiary: string;
  selected: string;
  state: "validated" | "pending" | "rejected" | "";
  paymentType: "deposit" | "expense" | "transport" | "gas" | "";
  requestId: string;
  userId: string;
  limit: string;
  page: string;
}

export type PaymentQueryParameter = {
  amountType?: "greater" | "less" | "equal";
  amount?: number;
  provider?: number;
  tab?: "validated" | "processed" | "paid" | "cancelled"
  type?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  paymentMethod?: number;
  beneficiary?: number;
  isSelected?: boolean;
  from?: Date,
  to?: Date,
  date?: "today" | "week" | "month" | "year" | "custom",
  search?: string;
  pageIndex: number;
  pageSize: number;
}

export type AccountantPaymentQueryParameter = {
  amountType?: "greater" | "less" | "equal";
  amount?: number;
  provider?: number;
  tab?: "pending" | "processed" | "paid" | "cancelled"
  priority?: "low" | "medium" | "high" | "urgent";
  from?: Date,
  to?: Date,
  date?: "today" | "week" | "month" | "year" | "custom",
  search?: string;
  pageIndex: number;
  pageSize: number;
}

export type DGPaymentQueryParameter = {
  tab?: "pending" | "processed" | "paid";
  priority?: "low" | "medium" | "high" | "urgent";
  from?: Date,
  to?: Date,
  date?: "today" | "week" | "month" | "year" | "custom",
  search?: string;
  pageIndex: number;
  pageSize: number;
}

export type PaymentSignQueryParameter = {
  tab: "pending" | "signed"
  search: string
  bank: number
  priority: "low" | "medium" | "high" | "urgent";
  amount: number
  amountType: "greater" | "less" | "equal"
  pageIndex: number,
  pageSize: number
}

@Route("request/payment")
@Tags("Payment Routes")
export default class PaymentController {
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
      invoiceId: Number(paymentData.invoiceId),
      isPartial: Boolean(paymentData.isPartial),
      proof: null,
      justification: null,
    };

    if (data.methodId) {
      payment.methodId = Number(payment.methodId);
    }

    if (proof) {
      payment.proof = normalizeFile(proof);
    }

    if (justification) {
      payment.justification = normalizeFile(justification);
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
      // commandId: Number(paymentData.commandId),
      vehiclesId: Number(paymentData.vehiclesId),
      methodId: Number(paymentData.methodId),
      isPartial: false,
      proof: null,
      justification: null,
    };

    if (paymentData.benefId) {
      payment.benefId = Number(paymentData.benefId);
    }

    if (proof) {
      payment.proof = normalizeFile(proof);
    }

    if (justification) {
      payment.justification = normalizeFile(justification);
    }

    if (caisseId) {
      payment.bankId = Number(caisseId);
    }

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
    if (paymentData.invoiceId) {
      payment.invoiceId = Number(paymentData.invoiceId);
    }

    if (proof) {
      // payment.proof = proof.map((p) => p.path.replace(/\\/g, "/")).join(";");
      payment.proof = normalizeFile(proof);
    }

    if (data.methodId) {
      payment.methodId = Number(payment.methodId);
    }

    if (justification) {
      // payment.justification = justification
      //   .map((p) => p.path.replace(/\\/g, "/"))
      //   .join(";");
      payment.justification = normalizeFile(justification);
    }

    if (data.requestId) {
      payment.requestId = Number(data.requestId);
    }

    return cmdRequestService.update(Number(id), payment);
  }

  /**
   * @summary Update Command request
   */
  @Put("/gas/{id}")
  updateGas(
    @Path() id: string,
    @Body()
    data: Payment,
  ): Promise<Payment> {
    return cmdRequestService.updateGas(Number(id), data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/settle/{id}")
  updateSettle(
    @Path() id: string,
    @Body()
    data: Payment,
  ): Promise<Payment> {
    return cmdRequestService.updateSettle(Number(id), data);
  }

  @Post("/payment/{id}")
  updateTransportPayment(
    @Path() id: string,
    @Body()
    data: Omit<Payment, "proof">,
  ): Promise<Payment> {
    return cmdRequestService.update(Number(id), data);
  }

  /**
   * @summary Update Command request
   */
  @Put("validate/{id}")
  validate(
    @Path() id: string,
    @Body() data: { userId: number; signDoc: Express.Multer.File[] | null },
  ): Promise<Payment> {
    const { signDoc, userId } = data;
    return cmdRequestService.validate(
      Number(id),
      { userId: Number(userId) },
      signDoc,
    );
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Payment> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Payment> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/request/:requestId")
  getOneByRequestId(@Path() requestId: string): Promise<Payment | null> {
    return cmdRequestService.getOneByRequestId(Number(requestId));
  }

  @Post("/paymentProof/{id}")
  paymentProof(
    @Path() id: string,
    @Body() proof: Express.Multer.File[] | null,
  ): Promise<Payment> {
    return cmdRequestService.paymentProof(
      Number(id),
      normalizeFile(proof),
      proof,
    );
  }

  // @Get("/")
  getAll(query: PaymentQueryOptions): Promise<{
    payments: Payment[],
    total: number,
  }> {
    return cmdRequestService.getAll(query);
  }

  @Get("/tickets-pending/count")
  getTicketsPendingCount(): Promise<number> {
    return cmdRequestService.getTicketsPendingCount();
  }

  @Get("/paymentToTreat/count")
  getPaymentToTreatCount(): Promise<number> {
    return cmdRequestService.getPaymentToTreatCount();
  }

  // @Get("/to-sign/count")
  getPaymentToSignCount(userId: number): Promise<number> {
    return cmdRequestService.getPaymentToSignCount(userId)
  }

  // @Get("/to-sign/all")
  getPaymentToSign(userId: number, queryParams: PaymentSignQueryParameter): Promise<{ data: Payment[], count: number }> {
    return cmdRequestService.getPaymentToSign(userId, queryParams)
  }

  // @Get("/to-sign/stats")
  getPaymentToSignStats(userId: number, queryParams: PaymentSignQueryParameter): Promise<{
    pending: {
      count: number;
      sum: number;
    };
    signed: {
      count: number;
      sum: number;
    };
    paid: {
      count: number;
      sum: number;
    };
  } | null> {
    return cmdRequestService.getPaymentToSignStat(userId, queryParams)
  }

  // @Get("/expenses/all")
  getExpenses(query: PaymentQueryParameter): Promise<{ data: Payment[], count: number } | null> {
    return cmdRequestService.getAllExpensesPayment(query)
  }

  // @Get("/expenses/stats")
  getExpensesStats(query: PaymentQueryParameter): Promise<{
    validated: {
      count: number;
      sum: number;
    };
    processed: {
      count: number;
      sum: number;
    };
    paid: {
      count: number;
      sum: number;
    };
    cancelled: {
      count: number;
      sum: number;
    };
  }> {
    return cmdRequestService.getAllExpensesStats(query)
  }

  // @Get("/expenses/accountant")
  getExpensesAccountant(query: AccountantPaymentQueryParameter): Promise<{ data: Payment[], count: number } | null> {
    return cmdRequestService.getAllExpensesAccountantPayment(query)
  }

  // @Get("/expenses/accountant/stats")
  getExpensesAccountantStats(query: AccountantPaymentQueryParameter): Promise<{
    pending: {
      count: number;
      sum: number;
    };
    processed: {
      count: number;
      sum: number;
    };
    paid: {
      count: number;
      sum: number;
    };
    cancelled: {
      count: number;
      sum: number;
    };
  }> {
    return cmdRequestService.getAllExpensesAccountantPaymentStats(query)
  }

  // @Get("/expenses/dg")
  getExpensesDG(query: DGPaymentQueryParameter): Promise<{ data: Payment[], count: number } | null> {
    return cmdRequestService.getAllExpensesDGPayment(query)
  }

  // @Get("/expenses/dg/stats")
  getExpensesDGStats(query: DGPaymentQueryParameter): Promise<{
    pending: {
      count: number;
      sum: number;
    };
    processed: {
      count: number;
      sum: number;
    };
    paid: {
      count: number;
      sum: number;
    };
  }> {
    return cmdRequestService.getAllExpensesDGPaymentStats(query)
  }
}
