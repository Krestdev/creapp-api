import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { VehicleService } from "./vehicleService";
import { Vehicle } from "@prisma/client";

const vehicleService = new VehicleService();

@Route("request/vehicle")
@Tags("Vehicle Routes")
export default class VehicleController {
  @Post("/")
  create(@Body() data: Vehicle): Promise<Vehicle> {
    return vehicleService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(@Path() id: string, @Body() data: Vehicle): Promise<Vehicle> {
    return vehicleService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Vehicle> {
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
