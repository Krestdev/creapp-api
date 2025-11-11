import { Project } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ProjectService } from "../services/projectServices";

const projectService = new ProjectService();

@Route("project")
@Tags("Projects Controller")
export default class ProjectController {
  @Post("/")
  create(@Body() data: Project) {
    return projectService.create(data);
  }

  @Put("/{id}")
  update(@Path() id: string, @Body() data: Project) {
    return projectService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string) {
    return projectService.delete(Number(id));
  }

  @Get("/")
  getAll() {
    return projectService.getAll();
  }

  @Get("/{id}")
  getOne(@Path() id: string) {
    return projectService.getOne(Number(id));
  }

  @Get("/{id}/chief")
  getChief(@Path() id: string) {
    return projectService.getChief(Number(id));
  }
}
