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
    @Body() data: Category & { validators: { userId: number; rank: number }[] }
  ): Promise<Category> {
    const { validators, ...ndata } = data;
    return categoryService.updateCategory(Number(id), ndata, validators);
  }

  @Post("/category")
  createCategory(
    @Body() data: Category & { validators: { userId: number; rank: number }[] }
  ): Promise<Category> {
    const { validators, ...ndata } = data;
    return categoryService.createCategory(ndata, validators);
  }

  @Delete("/category/{id}")
  deleteCategory(@Path() id: string): Promise<Category> {
    return categoryService.deleteCategory(Number(id));
  }
}
