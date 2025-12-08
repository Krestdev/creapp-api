import { Department, Member } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { DepartmentService } from "../services/departmentService";

const departmentService = new DepartmentService();

@Route("base/Department")
@Tags("Department Routes")
export default class DepartmentController {
  @Post()
  create(
    @Body()
    data: Omit<Department, "createdAt" | "updatedAt"> & { chiefId: number }
  ): Promise<Department> {
    return departmentService.create(data);
  }

  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Partial<Omit<Department, "createdAt" | "updatedAt">> & {
      members: Member[];
    }
  ): Promise<Department> {
    return departmentService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<unknown> {
    return departmentService.delete(Number(id));
  }

  @Get("/")
  getAll(): Promise<Department[]> {
    return departmentService.getAll();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Department | null> {
    return departmentService.getOne(Number(id));
  }

  @Get("/{id}/members")
  getMembers(@Path() id: string): Promise<Member[]> {
    return departmentService.getMembers(Number(id));
  }

  @Post("/{id}/members")
  addMember(
    @Path() id: string,
    @Body() data: { userId: number; label: string }
  ): Promise<Member> {
    const { userId, label } = data;
    const departmentId = Number(id);
    return departmentService.addMember(departmentId, userId, undefined, label);
  }

  @Delete("/{id}/members")
  removeMember(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<unknown> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.removeMember(departmentId, userId);
  }

  @Get("/{id}/validators")
  getValidators(@Path() id: string): Promise<Member[]> {
    return departmentService.getValidators(Number(id));
  }

  @Delete("/{id}/validators")
  removeValidator(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<unknown> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.removeValidator(departmentId, userId);
  }

  @Post("/{id}/final-validators")
  addFinalValidator(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<Member> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.addFinalValidator(departmentId, userId);
  }

  @Delete("/{id}/final-validators")
  removeFinalValidator(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<unknown> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.removeFinalValidator(departmentId, userId);
  }

  @Get("/{id}/final-validators")
  getFinalValidators(@Path() id: string): Promise<Member[]> {
    return departmentService.getFinalValidators(Number(id));
  }

  @Post("/{id}/validators")
  addValidator(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<Member> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.addValidator(departmentId, userId);
  }

  @Post("/{id}/chief")
  setDepartmentChief(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<unknown> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.setDepartmentChief(departmentId, userId);
  }

  @Delete("/{id}/chief")
  unSetDepartmentChief(
    @Path() id: string,
    @Body() data: { userId: number }
  ): Promise<unknown> {
    const { userId } = data;
    const departmentId = Number(id);
    return departmentService.unsetDepartmentChief(departmentId, userId);
  }
}
