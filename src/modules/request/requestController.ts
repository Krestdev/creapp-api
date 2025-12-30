import { Payment, RequestModel, RequestValidation } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { RequestService } from "./requestService";

const requestService = new RequestService();

@Route("request/object")
@Tags("Request Routes")
export default class RequestController {
  /**
   * @summary Creates a user request
   */
  @Post("/")
  create(
    @Body()
    data: Omit<RequestModel, "createdAt" | "updatedAt"> & { benef?: number[] }
  ): Promise<RequestModel> {
    const { benef, ...ndata } = data;
    return requestService.create(ndata, benef);
  }

  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: RequestModel & { benef?: number[] }
  ): Promise<RequestModel> {
    const { benef, ...ndata } = data;
    return requestService.update(Number(id), ndata, benef);
  }

  @Get("/")
  getAll(): Promise<RequestModel[]> {
    return requestService.getAll();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<RequestModel | null> {
    return requestService.getOne(Number(id));
  }

  @Get("/mine/{id}")
  getMine(@Path() id: string): Promise<RequestModel[]> {
    // needs user Id
    return requestService.getMine(Number(id));
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<RequestModel | null> {
    return requestService.delete(Number(id));
  }

  @Put("/validate/{id}")
  validate(
    @Path() id: string,
    @Body() data: { validatorId: number }
  ): Promise<RequestModel> {
    return requestService.validate(Number(id), data.validatorId);
  }

  @Put("/review/{id}")
  reviewed(
    @Path() id: string,
    @Body() data: { userId: number; validated: boolean; decision?: string }
  ): Promise<RequestValidation> {
    return requestService.review(Number(id), data);
  }

  @Put("/validateBulk")
  validateBulk(
    @Body() data: { validatorId: number } & { ids: number[] }
  ): Promise<RequestModel[]> {
    const { ids, ...valData } = data;
    return requestService.validateBulk(ids, valData.validatorId);
  }

  @Put("/reviewBulk")
  reviewedBulk(
    @Body()
    data: { userId: number; validated: boolean; decision?: string } & {
      ids: number[];
    }
  ): Promise<RequestValidation[]> {
    const { ids, ...revData } = data;
    return requestService.reviewBulk(ids, revData);
  }

  @Put("/reject/{id}")
  reject(@Path() id: string): Promise<RequestModel> {
    return requestService.reject(Number(id));
  }

  @Put("/priority/{id}")
  priority(
    @Path() id: string,
    @Body() data: { priority: string }
  ): Promise<RequestModel> {
    return requestService.priority(Number(id), data.priority);
  }

  @Put("/submit/{id}")
  submit(@Path() id: string): Promise<RequestModel> {
    return requestService.submit(Number(id));
  }

  @Post("/special")
  specialRequest(
    @Body()
    data: RequestModel & { type: string; proof?: string } & { benef?: number[] }
  ): Promise<{ request: RequestModel; payment: Payment }> {
    // create request, command and payment
    const { proof, benef, ...reqData } = data;

    const request: RequestModel & { type: string; proof: string | null } = {
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
      proof: proof ?? null,
    };

    return requestService.specialRequest(
      request,
      JSON.parse((benef as unknown as string) ?? "[]")
    );
  }

  @Get("/special")
  specialGet(): Promise<RequestModel[]> {
    return requestService.specialGet();
  }
}
