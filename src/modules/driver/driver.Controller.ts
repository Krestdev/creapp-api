import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { Driver } from "@prisma/client";
import { getIO } from "../../socket";
import { DriverService } from "./driver.Service";
import { isMulterFiles, normalizeFile } from "../../utils/serverUtils";

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
      newDriver.licence = licence
        .map((p) => p.path.replace(/\\/g, "/"))
        .join(";");
    }

    if (idCard) {
      newDriver.idCard = idCard
        .map((p) => p.path.replace(/\\/g, "/"))
        .join(";");
    }

    const files = {
      licence: data.licence ? data.licence : null,
      idCard: data.idCard ? data.idCard : null,
    };

    return driverService.create(newDriver, { ...files });
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
      licence: normalizeFile(data.licence),
      idCard: normalizeFile(data.idCard),
    };

    const files = {
      licence: isMulterFiles(data.licence) ? data.licence : null,
      idCard: isMulterFiles(data.idCard) ? data.idCard : null,
    };

    getIO().emit("driver:update");
    return driverService.update(Number(id), newDriver, { ...files });
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
