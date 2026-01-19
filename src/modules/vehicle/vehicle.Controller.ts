import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { VehicleService } from "./vehicle.Service";
import { Vehicle } from "@prisma/client";
import { getIO } from "../../socket";

const vehicleService = new VehicleService();

@Route("request/vehicle")
@Tags("Vehicle Routes")
export default class VehicleController {
  @Post("/")
  create(
    @Body()
    data: Vehicle & {
      proof: Express.Multer.File[] | null;
    },
  ): Promise<Vehicle> {
    const { proof } = data;
    const newVehicle: Omit<Vehicle, "createdAt" | "updatedAt" | "id"> = {
      label: data.label,
      mark: data.mark,
      matricule: data.matricule,
      picture: proof
        ? proof.map((p) => p.path.replace(/\\/g, "/")).join(";")
        : null,
    };
    getIO().emit("vehicle:new");
    return vehicleService.create(newVehicle);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Vehicle & {
      proof: Express.Multer.File[] | null;
    },
  ): Promise<Vehicle> {
    const { proof, label, mark, matricule } = data;
    const newVehicle: Partial<Vehicle> = {};

    if (label) {
      newVehicle.label = label;
    }
    if (mark) {
      newVehicle.mark = mark;
    }
    if (matricule) {
      newVehicle.matricule = matricule;
    }
    if (proof) {
      newVehicle.picture = proof
        .map((p) => p.path.replace(/\\/g, "/"))
        .join(";");
    }

    getIO().emit("vehicle:update");
    return vehicleService.update(Number(id), newVehicle);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Vehicle> {
    getIO().emit("vehicle:delete");
    return vehicleService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Vehicle> {
    return vehicleService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Vehicle[]> {
    return vehicleService.getAll();
  }
}
