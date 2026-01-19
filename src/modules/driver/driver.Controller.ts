import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { Driver } from "@prisma/client";
import { getIO } from "../../socket";
import { DriverService } from "./driver.Service";

const driverService = new DriverService();

@Route("request/driver")
@Tags("Driver Routes")
export default class DriverController {
  @Post("/")
  create(
    @Body()
    data: Omit<Driver, "licence" | "idCard"> & {
      licence: Express.Multer.File[] | null;
      idCard: Express.Multer.File[] | null;
    },
  ): Promise<Driver> {
    const { licence, idCard } = data;
    const newDriver: Driver = {
      ...data,
      licence: null,
      idCard: null,
    };

    if (licence) {
      newDriver.licence = licence.map((p) => p.filename).join(";");
    }

    if (idCard) {
      newDriver.idCard = idCard.map((p) => p.filename).join(";");
    }

    getIO().emit("driver:new");
    return driverService.create(newDriver, { ...data });
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Omit<Driver, "licence" | "idCard"> & {
      licence: Express.Multer.File[] | null;
      idCard: Express.Multer.File[] | null;
    },
  ): Promise<Driver> {
    const newDriver = {
      ...data,
      licence:
        data.licence && data.licence[0] ? data.licence[0].filename : null,
      idCard: data.idCard && data.idCard[0] ? data.idCard[0].filename : null,
    };

    getIO().emit("driver:update");
    return driverService.update(Number(id), newDriver, { ...data });
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Driver> {
    getIO().emit("driver:delete");
    return driverService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Driver> {
    return driverService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Driver[]> {
    return driverService.getAll();
  }
}
