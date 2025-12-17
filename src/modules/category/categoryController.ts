import { Category } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { CategoryService } from "./categoryService";

const categoryService = new CategoryService();

@Route("request")
@Tags("Category Routes")
export default class CategoryController {
  @Get("/category")
  getGategory(): Promise<Category[]> {
    return categoryService.getAllCategories();
  }

  @Get("/category/{id}")
  getOneCategory(@Path() id: string): Promise<Category | null> {
    return categoryService.getOneCategory(Number(id));
  }

  @Put("/category/{id}")
  updateOneCategory(
    @Path() id: string,
    @Body() data: Category
  ): Promise<Category> {
    return categoryService.updateCategory(Number(id), data);
  }

  @Post("/category")
  createCategory(@Body() data: Category): Promise<Category> {
    return categoryService.createCategory(data);
  }

  @Get("/category/{id}/children")
  getChilrenCategories(@Path() id: string): Promise<Category[]> {
    return categoryService.getAllChildren(Number(id));
  }

  @Get("/category/special")
  getSpecialCategories(): Promise<Category[]> {
    return categoryService.getAllSpecialCategory(true);
  }

  @Delete("/category/{id}")
  deleteCategory(@Path() id: string): Promise<Category> {
    return categoryService.deleteCategory(Number(id));
  }
}
