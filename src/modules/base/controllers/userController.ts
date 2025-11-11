import { Role, RolePages, User } from "@prisma/client";
import {
  Body,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Put,
  Query,
  Route,
  Tags,
} from "tsoa";
import { UserService } from "../services/userService";

const userService = new UserService();

@Route("base/user")
@Tags("User Controller")
export default class UserController {
  @Post("/register")
  create(@Body() data: User & { roleId: number }) {
    return userService.create(data);
  }

  @Post("/login")
  login(@Body() data: { email: string; password: string }) {
    return userService.login(data);
  }

  @Post("/verify/{otp}")
  verify(@Path() otp: string, @Query() email: string) {
    return userService.verifyAccount(email as string, otp);
  }

  @Put("/{id}")
  update(@Path() id: number, @Body() data: Partial<User> & { role?: string }) {
    return userService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<User> {
    return userService.delete(Number(id));
  }

  @Get("/")
  getAll(): Promise<
    ({
      role: {
        id: number;
        label: string;
      }[];
    } & Omit<User, "password">)[]
  > {
    return userService.getAll();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Omit<User, "password">> {
    return userService.getOne(Number(id));
  }

  @Get("/role/list")
  getRoles(): Promise<Role[]> {
    return userService.getRoles();
  }

  @Post("/role/create")
  createRole(@Body() data: { label: string }): Promise<Role> {
    return userService.createRole(data);
  }

  @Post("/{id}/roles")
  addRole(
    @Path() id: string,
    @Body() data: { roleId: string }
  ): Promise<
    User & {
      role: Role[];
    }
  > {
    const { roleId } = data;
    return userService.addRoleToUser(Number(id), roleId);
  }

  @Delete("/{id}/roles")
  removeRole(
    @Path() id: string,
    @Body() data: { roleId: number }
  ): Promise<
    User & {
      role: Role[];
    }
  > {
    const { roleId } = data;
    return userService.removeRoleFromUser(Number(id), roleId);
  }

  //createRolePage
  @Post("/createRolePages")
  createRolePages(@Body() data: { pageIds: string[] }): Promise<unknown> {
    const { pageIds } = data;
    return userService.createRolePages(pageIds);
  }

  //deleteRolePage
  @Delete("/deleteRolePages")
  deleteRolePages(@Body() data: { rolePageIds: number[] }): Promise<unknown> {
    return userService.deleteRolePages(data.rolePageIds);
  }

  //addPageToRole
  @Post("/addRolePages")
  addPageToRole(
    @Body() data: { roleId: number; pageId: number }
  ): Promise<RolePages> {
    const { roleId, pageId } = data;
    return userService.addPageToRole(roleId, pageId);
  }

  //removePageFromRole
  @Patch("/removePageFromRole")
  removePageFromRole(
    @Body() data: { roleId: number; pageId: string }
  ): Promise<RolePages[]> {
    const { roleId, pageId } = data;
    return userService.removePageFromRole(roleId, pageId);
  }

  //getRolePages
  @Get("/rolePages/{roleId}")
  getRolePages(@Path() roleId: string): Promise<RolePages[]> {
    return userService.getRolePages(Number(roleId));
  }
}
