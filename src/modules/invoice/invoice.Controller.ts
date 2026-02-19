import { Invoice } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { InvoiceService } from "./invoice.Service";
import { getIO } from "../../socket";

const cmdRequestService = new InvoiceService();

@Route("request/invoice")
@Tags("Invoice Routes")
export default class CmdRequestController {
  @Post("/")
  create(
    @Body()
    data: Omit<Invoice, "proof" | "justification"> & {
      proof: Express.Multer.File[] | null;
      justification: Express.Multer.File[] | null;
    },
  ): Promise<Invoice> {
    const { proof, justification, ...invoiceData } = data;
    const invoice: Omit<
      Invoice,
      "id" | "reference" | "status" | "createdAt" | "updatedAt"
    > = {
      title: invoiceData.title,
      isPartial: Boolean(invoiceData.isPartial),
      deadline: new Date(invoiceData.deadline),
      amount: Number(invoiceData.amount),
      userId: Number(invoiceData.userId),
      commandId: Number(invoiceData.commandId),
      proof: null,
    };

    if (proof) {
      invoice.proof = proof.map((p) => p.path.replace(/\\/g, "/")).join(";");
    }

    getIO().emit("invoice:new");
    return cmdRequestService.create(invoice, proof);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Partial<Omit<Invoice, "proof">> & {
      justification: Express.Multer.File[] | null;
      proof: Express.Multer.File[] | null;
    },
  ): Promise<Invoice> {
    const { justification, proof, ...invoiceData } = data;
    const invoice: Partial<Invoice> = {
      ...invoiceData,
    };

    if (
      invoiceData.deadline &&
      (invoiceData.deadline as unknown as string) !== "undefined"
    ) {
      invoice.deadline = new Date(invoiceData.deadline);
    }
    if (invoiceData.amount) {
      invoice.amount = Number(invoiceData.amount);
    }
    if (invoiceData.userId) {
      invoice.userId = Number(invoiceData.userId);
    }
    // if (invoiceData.commandId) {
    //   invoice.commandId = Number(invoiceData.commandId);
    // }

    if (proof) {
      invoice.proof = proof.map((p) => p.path.replace(/\\/g, "/")).join(";");
    }

    return cmdRequestService.update(Number(id), invoice);
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Invoice> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Invoice[]> {
    return cmdRequestService.getAll();
  }
}
