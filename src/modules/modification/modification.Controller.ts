import { modification } from "@prisma/client";
import { ModificationService } from "./modification.Service";

const modificationService = new ModificationService();

// @Route("request/modification")
// @Tags("modification Routes")
export default class ModificationController {
  // @Post("/")
  create(data: modification): Promise<modification> {
    return modificationService.create(data);
  }

  /**
   * @summary Update Command request
   */
  // @Put("/{id}")
  update(
    id: string,
    data: modification,
  ): Promise<modification> {
    return modificationService.update(Number(id), data);
  }

  // @Delete("/{id}")
  delete(id: string): Promise<modification> {
    return modificationService.delete(Number(id));
  }

  // @Get("/{id}")
  getOne(id: string): Promise<modification> {
    return modificationService.getOne(Number(id));
  }

  // @Get("/")
  getAll(): Promise<modification[]> {
    return modificationService.getAll();
  }

  // @Get("/me/{id}")
  validateAndApply(id: number, decision: boolean): Promise<modification> {
    return modificationService.validate(id, decision);
  }
}
