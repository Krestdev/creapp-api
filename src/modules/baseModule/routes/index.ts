import { Router } from "express";
import UserRouter from "./userRoute";
import DepartmentRouter from "./departmentRoute";

export function connectBaseRoutes() {
  const router = Router();
  const userRouter = new UserRouter();
  const departmentRouter = new DepartmentRouter();

  // user routes connection
  router.use("/user", userRouter.routes);

  // department routes connection (uncomment when needed)
  router.use("/department", departmentRouter.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
