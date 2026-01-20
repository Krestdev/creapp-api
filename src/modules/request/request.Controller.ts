import { Payment, RequestValidation } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { RequestService } from "./request.Service";
import { getIO } from "../../socket";

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
};

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

  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: RequestModelDto & { benef?: number[] },
  ): Promise<unknown> {
    const { benef, ...ndata } = data;
    return requestService.update(Number(id), ndata, benef);
  }

  @Get("/")
  getAll(): Promise<unknown[]> {
    return requestService.getAll();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<unknown | null> {
    return requestService.getOne(Number(id));
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
    @Body() data: { validatorId: number },
  ): Promise<unknown> {
    return requestService.validate(Number(id), data.validatorId);
  }

  @Put("/review/{id}")
  reviewed(
    @Path() id: string,
    @Body() data: { userId: number; validated: boolean; decision?: string },
  ): Promise<RequestValidation> {
    return requestService.review(Number(id), data);
  }

  @Put("/validateBulk")
  validateBulk(
    @Body() data: { validatorId: number } & { ids: number[] },
  ): Promise<unknown[]> {
    const { ids, ...valData } = data;
    return requestService.validateBulk(ids, valData.validatorId);
  }

  @Put("/reviewBulk")
  reviewedBulk(
    @Body()
    data: { validatorId: number; validated: boolean; decision?: string } & {
      ids: number[];
    },
  ): Promise<RequestValidation[]> {
    const { ids, ...revData } = data;
    return requestService.reviewBulk(ids, revData);
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
      request.proof = proof.map((p) => p.path.replace(/\\/g, "/")).join(";");
    }

    return requestService.specialRequest(
      request,
      proof,
      JSON.parse((benef as unknown as string) ?? "[]"),
    );
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
      quantity: reqData.quantity ? Number(reqData.quantity) : 0,
      amount: reqData.amount ? Number(reqData.amount) : 0,
      projectId: reqData.projectId ? Number(reqData.projectId) : null,
      categoryId: Number(reqData.categoryId),
      userId: Number(reqData.userId),
    };

    let file;

    if (proof && typeof proof !== "string") {
      file = proof;
      request.proof = proof.map((p) => p.path.replace(/\\/g, "/")).join(";");
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
