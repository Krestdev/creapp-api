import { Category, RequestModel, RequestValidation } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { RequestService } from "../services/requestService";

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
  validate(@Path() id: string): Promise<RequestModel> {
    return requestService.validate(Number(id));
  }

  @Put("/review/{id}")
  reviewed(
    @Path() id: string,
    @Body() data: { userId: number; validated: boolean; decision?: string }
  ): Promise<RequestValidation> {
    return requestService.review(Number(id), data);
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

  @Get("/category")
  getGategory(): Promise<Category[]> {
    return requestService.getAllCategories();
  }

  @Get("/category/{id}")
  getOneCategory(@Path() id: string): Promise<Category | null> {
    return requestService.getOneCategory(Number(id));
  }

  @Put("/category/{id}")
  updateOneCategory(
    @Path() id: string,
    @Body() data: Category
  ): Promise<Category> {
    return requestService.updateCategory(Number(id), data);
  }

  @Post("/category")
  createCategory(@Body() data: Category): Promise<Category> {
    return requestService.createCategory(data);
  }

  @Get("/category/{id}/children")
  getChilrenCategories(@Path() id: string): Promise<Category[]> {
    return requestService.getAllChildren(Number(id));
  }

  @Get("/category/special")
  getSpecialCategories(): Promise<Category[]> {
    return requestService.getAllSpecialCategory(true);
  }

  @Delete("/category/{id}")
  deleteCategory(@Path() id: string): Promise<Category> {
    return requestService.deleteCategory(Number(id));
  }
}
