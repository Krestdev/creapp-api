import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ReceptionService } from "./reception.Service";
import { Reception } from "@prisma/client";
import { getIO } from "../../socket";

const receptionService = new ReceptionService();

@Route("request/reception")
@Tags("Reception Routes")
export default class ReceptionController {
  @Post("/")
  create(@Body() data: Reception): Promise<Reception> {
    getIO().emit("reception:new");
    return receptionService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Omit<Reception, "Proof"> & { proof: Express.Multer.File[] | null } & {
      Deliverables: { id: number; state: boolean }[];
    },
  ): Promise<Reception> {
    const { proof, Deliverables, ...restData } = data;

    const newReception = {
      ...restData,
      Deliverables: [],
      Proof: proof ? proof.map((p) => p.path).join(";") : null,
    };

    if (Deliverables) {
      newReception.Deliverables = JSON.parse(Deliverables as unknown as string);
    }

    getIO().emit("reception:update");
    return receptionService.update(Number(id), newReception, proof);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Reception> {
    getIO().emit("reception:delete");
    return receptionService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Reception> {
    return receptionService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Reception[]> {
    return receptionService.getAll();
  }
}
