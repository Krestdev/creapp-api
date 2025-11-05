import { Router } from "express";
import requestRouter from "./requestRoutes";
export function connectRequestRoutes() {
  const router = Router();
  const request = new requestRouter();

  // request routes connection
  router.use("/", request.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
