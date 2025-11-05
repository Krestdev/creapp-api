import { Router } from "express";
import projectRouter from "./projectRoutes";
export function connectProjectRoutes() {
  const router = Router();
  const project = new projectRouter();

  // project routes connection
  router.use("/project-manage", project.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Project Module" });
  });

  return router;
}
