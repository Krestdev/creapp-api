import { Payment, RequestModel, RequestPayType } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Query, Route, Tags } from "tsoa";
import { getIO } from "../../socket";
import { RequestService } from "./request.Service";
import { normalizeFile } from "../../utils/serverUtils";
import { Request } from 'express'

const requestService = new RequestService();

type RequestModelDto = {
  id: number;
  ref: string;
  label: string;
  description: string | null;
  quantity: number;
  dueDate: Date;
  period: string;
  benFac: string;
  unit: string;
  beneficiary: string;
  amount: number | null;
  type: string;
  state: string;
  priority: string;
  categoryId: number;
  userId: number | null;
  projectId: number | null;
  createdAt: Date;
  updatedAt: Date;
  commandRequestId: number | null;
  commandId: number | null;
  paytype: RequestPayType;
};

export type QueryString = {
  pageIndex: number;
  pageSize: number;
  header?: string;
  section?: string;
  reviewer?: number;
  search?: string,
  user?: number,
  category?: number,
  project?: number,
  status?: string,
  type?: "all" | "facilitation" | "ressource_humaine" | "speciaux" | "achat" | "CURRENT" | "others" | "transport" | "gas" | "appro" | "taxes" | "settle",
  from?: Date,
  to?: Date,
  date?: "today" | "week" | "month" | "year" | "custom",
}

@Route("request/object")
@Tags("Request Routes")
export default class RequestController {
  /**
   * @summary Creates a user request
   */
  @Post("/")
  create(
    @Body()
    data: Omit<RequestModelDto, "createdAt" | "updatedAt"> & {
      benef?: number[];
    },
  ): Promise<unknown> {
    const { benef, ...ndata } = data;
    return requestService.create(ndata, benef);
  }

  @Put("/takeaction/{id}")
  takeAction(
    @Path() id: string,
    @Body() data: { authUserId: string; decision: string },
  ): Promise<unknown> {
    const { decision } = data;
    return requestService.takeAction(+id, decision, +data.authUserId);
  }

  @Get("/chief/{id}")
  chiefrequest(@Path() id: number): Promise<unknown> {
    return requestService.chiefrequests(id);
  }

  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: RequestModelDto & { benef?: number[]; authUserId: number },
  ): Promise<unknown> {
    const { benef, authUserId, ...ndata } = data;
    return requestService.update(Number(id), ndata, authUserId, benef);
  }

  // @Get("/")
  getAll(query?: QueryString): Promise<{
    data: unknown[], total: number;
  }> {
    return requestService.getAll(query);
  }

  // @Get("/stats")
  getStats(query?: QueryString): Promise<{
    awaiting: number;
    rejected: number;
    validated: number;
    fromStore: number;
    cancelled: number;
    sent: number;
  }> {
    return requestService.getStats(query);
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<unknown | null> {
    return requestService.getOne(Number(id));
  }

  @Get("/quotation")
  getForQuotation(): Promise<unknown[]> {
    return requestService.getForQuotation();
  }

  @Get("/requestsWithPayment")
  getAllRequestsHavingPayment(): Promise<unknown[]> {
    return requestService.getAllRequestsHavingPayment();
  }

  // @Get("/pendingRequests/count")
  getPendingRequests(request: { userId: number }): Promise<number> {
    return requestService.getPendingRequests(request);
  }

  // @Get("/chief/requests")
  getChiefRequests(request: { userId: number }): Promise<number> {
    return requestService.getChiefRequests(request);
  }

  getBoardRequestStats(request: { userId: number }): Promise<{
    awaiting: number;
    rejected: number;
    submited: number;
    approved: number;
    approvedTotal: number;
    total: number;
  }> {
    return requestService.getAllRequestStats(request);
  }

  getBoardRequestGraph(request: { userId: number }): Promise<{
    submited: {
      state: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    validator: {
      state: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    all: {
      state: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }> {
    return requestService.getAllRequestGraphs(request);
  }

  @Get("/usableRequests/count")
  getUsableRequests(): Promise<number> {
    return requestService.getUsableRequests();
  }

  @Get("/validator/{id}")
  getMyValidator(@Path() id: string): Promise<unknown[]> {
    // needs user Id
    return requestService.getMyValidator(Number(id));
  }

  @Get("/mine/{id}")
  getMine(@Path() id: string): Promise<unknown[]> {
    // needs user Id
    return requestService.getMine(Number(id));
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<unknown | null> {
    getIO().emit("request:delete");
    return requestService.delete(Number(id));
  }

  @Put("/validate/{id}")
  validate(
    @Path() id: string,
    @Body() data: { validatorId: number; userId: number },
  ): Promise<unknown> {
    return requestService.validate(Number(id), data.validatorId, data.userId);
  }

  @Put("/review/{id}")
  reviewed(
    @Path() id: string,
    @Body()
    data: {
      userId: number;
      validated: boolean;
      decision?: string;
      userIdV: number;
    },
  ): Promise<unknown> {
    const { userIdV, ...restInfo } = data;
    return requestService.review(Number(id), restInfo, userIdV);
  }

  @Put("/validateBulk")
  validateBulk(
    @Body() data: { validatorId: number } & { ids: number[]; userId: number },
  ): Promise<unknown[]> {
    const { ids, userId, ...valData } = data;
    return requestService.validateBulk(ids, valData.validatorId, userId);
  }

  @Put("/reviewBulk")
  reviewedBulk(
    @Body()
    data: { validatorId: number; validated: boolean; decision?: string } & {
      ids: number[];
      userId: number;
    },
  ): Promise<unknown[]> {
    const { ids, userId, ...revData } = data;
    return requestService.reviewBulk(ids, revData, userId);
  }

  @Put("/reject/{id}")
  reject(@Path() id: string): Promise<unknown> {
    return requestService.reject(Number(id));
  }

  @Put("/priority/{id}")
  priority(
    @Path() id: string,
    @Body() data: { priority: string },
  ): Promise<unknown> {
    return requestService.priority(Number(id), data.priority);
  }

  @Put("/submit/{id}")
  submit(@Path() id: string): Promise<unknown> {
    return requestService.submit(Number(id));
  }

  @Post("/special")
  specialRequest(
    @Body()
    data: RequestModelDto & {
      type: string;
      proof: Express.Multer.File[] | null;
    } & {
      benef?: number[];
    },
  ): Promise<{ request: unknown; payment: Payment }> {
    // create request, command and payment
    const { proof, benef, ...reqData } = data;

    const request: RequestModelDto & { type: string; proof: string | null } = {
      ...reqData,
      label: reqData.label,
      description: reqData.description,
      quantity: reqData.quantity ? Number(reqData.quantity) : 0,
      dueDate: reqData.dueDate,
      unit: reqData.unit,
      beneficiary: reqData.beneficiary,
      amount: reqData.amount ? Number(reqData.amount) : 0,
      state: reqData.state,
      projectId: reqData.projectId ? Number(reqData.projectId) : null,
      priority: reqData.priority,
      categoryId: Number(reqData.categoryId),
      userId: Number(reqData.userId),
      proof: null,
    };

    if (proof) {
      request.proof = normalizeFile(proof);
    }

    return requestService.specialRequest(
      request,
      proof,
      JSON.parse((benef as unknown as string) ?? "[]"),
    );
  }

  @Post("/approvisionement")
  approvisionementRequest(
    @Body()
    data: RequestModelDto,
  ): Promise<{ request: unknown; payment: Payment }> {
    return requestService.approvisionement(data);
  }

  @Post("/special/update/{id}")
  specialRequestUpdate(
    @Path() id: number,
    @Body()
    data: Omit<RequestModelDto, "proof"> & {
      type: string;
      proof?: Express.Multer.File[] | null;
    } & {
      benef?: number[];
    },
  ): Promise<unknown> {
    // create request, command and payment
    const { proof, benef, ...reqData } = data;

    const request: Partial<RequestModelDto> & {
      type: string;
      proof?: string | null;
    } = {
      ...reqData,
      id: Number(reqData.id),
      quantity: reqData.quantity ? Number(reqData.quantity) : 0,
      amount: reqData.amount ? Number(reqData.amount) : 0,
      projectId: reqData.projectId ? Number(reqData.projectId) : null,
      categoryId: Number(reqData.categoryId),
      userId: Number(reqData.userId),
      type: data.type,
      paytype: data.paytype,
    };

    let file;

    if (proof && typeof proof !== "string") {
      file = proof;
      request.proof = normalizeFile(proof);
    }

    return requestService.specialRequestUpdate(
      id,
      request,
      file,
      JSON.parse((benef as unknown as string) ?? "[]"),
    );
  }

  @Get("/special")
  specialGet(): Promise<unknown[]> {
    return requestService.specialGet();
  }


}
