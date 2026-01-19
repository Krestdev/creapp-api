import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { NotificationService } from "./notification.Service";
import { Notification } from "@prisma/client";

const cmdRequestService = new NotificationService();

@Route("request/notification")
@Tags("Notification Routes")
export default class NotificationController {
  @Post("/")
  create(@Body() data: Notification): Promise<Notification> {
    return cmdRequestService.create(data);
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body() data: Notification,
  ): Promise<Notification> {
    return cmdRequestService.update(Number(id), data);
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Notification> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Notification> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Notification[]> {
    return cmdRequestService.getAll();
  }

  @Get("/me/{id}")
  getMyNotifications(@Path() id: number): Promise<Notification[]> {
    return cmdRequestService.getMyNotif(id);
  }
}
