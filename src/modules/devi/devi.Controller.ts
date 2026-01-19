import { Devi, DeviElement, Prisma } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { DeviService } from "./devi.Service";
import { getIO } from "../../socket";

const deviService = new DeviService();

@Route("request/devi")
@Tags("Devi Routes")
export default class DeviController {
  @Post("/")
  create(
    @Body()
    data: {
      devis: Devi & { userId: number };
      proof: Express.Multer.File[];
      elements: DeviElement[];
    },
  ): Promise<Devi> {
    const { proof } = data;
    const devi: Devi & { proof: string } = {
      ...(JSON.parse(data.devis as unknown as string) as Devi),
    };

    if (proof) {
      devi.proof = proof.map((p) => p.path).join(";");
    }

    const deviElem: DeviElement[] = JSON.parse(
      data.elements as unknown as string,
    ) as DeviElement[];

    getIO().emit("quotation:new");
    return deviService.create(devi, deviElem);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: { devis: Devi & { userId: number }; elements: DeviElement[] },
  ): Promise<Devi> {
    const devi: Devi & { proof: string } = {
      ...(JSON.parse(data.devis as unknown as string) as Devi),
      proof: (data as unknown as { filename: string }).filename,
    };
    const deviElem: DeviElement[] = JSON.parse(
      data.elements as unknown as string,
    ) as DeviElement[];

    getIO().emit("quotation:update");
    return deviService.update(Number(id), devi, deviElem);
  }

  @Put("/validerDevis")
  validerDevis(
    @Body()
    date: {
      deviId: number;
      userId: number;
      commandRequestId: number;
      elements: {
        name: string;
        elementIds: number[];
      }[];
    }[],
  ): Promise<Prisma.BatchPayload> {
    getIO().emit("quotation:update");
    return deviService.validateDevi(date);
  }

  @Put("/element/{id}")
  updateDeviElement(
    @Path() id: string,
    @Body() data: DeviElement,
  ): Promise<DeviElement> {
    getIO().emit("quotation:update");
    return deviService.updateDeviElement(Number(id), data);
  }

  @Put("/element/remove/{id}")
  removeElement(
    @Path() id: string,
    @Body() elementIds: number[],
  ): Promise<Devi> {
    getIO().emit("quotation:update");
    return deviService.removeElement(Number(id), elementIds);
  }

  @Put("/element/add/{id}")
  async addDeviElement(
    @Path() id: string,
    @Body() data: { ndata: DeviElement[]; ids?: number[] },
  ): Promise<Devi | undefined> {
    getIO().emit("quotation:update");
    return await deviService.addElement(Number(id), data.ndata, data.ids);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Devi> {
    getIO().emit("quotation:delete");
    return deviService.delete(Number(id));
  }

  @Delete("/element/{id}")
  deleteElement(@Path() id: string): Promise<DeviElement> {
    getIO().emit("quotation:delete");
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
