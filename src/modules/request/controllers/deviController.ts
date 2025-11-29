import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { DeviService } from "../services/deviService";
import { Devi, DeviElement } from "@prisma/client";

const deviService = new DeviService();

@Route("request/devi")
@Tags("Devi Routes")
export default class DeviController {
  @Post("/")
  create(
    @Body() data: { devis: Devi; elements: DeviElement[] }
  ): Promise<Devi> {
    return deviService.create(data.devis, data.elements);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Devi): Promise<Devi> {
    return deviService.update(Number(id), data);
  }

  @Put("/element/{id}")
  updateDeviElement(
    @Path() id: string,
    @Body() data: DeviElement
  ): Promise<DeviElement> {
    return deviService.updateDeviElement(Number(id), data);
  }

  @Put("/element/remove/{id}")
  removeElement(
    @Path() id: String,
    @Body() elementIds: number[]
  ): Promise<Devi> {
    return deviService.removeElement(Number(id), elementIds);
  }

  @Put("/element/add/{id}")
  async addDeviElement(
    @Path() id: string,
    @Body() data: { ndata: DeviElement[]; ids?: number[] }
  ): Promise<Devi | undefined> {
    return await deviService.addElement(Number(id), data.ndata, data.ids);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Devi> {
    return deviService.delete(Number(id));
  }

  @Delete("/element/{id}")
  deleteElement(@Path() id: string): Promise<DeviElement> {
    return deviService.deleteElement(Number(id));
  }

  @Get("/element/")
  getAllElement(): Promise<DeviElement[]> {
    return deviService.getAllDeviElement();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Devi> {
    return deviService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Devi[]> {
    return deviService.getAll();
  }
}
