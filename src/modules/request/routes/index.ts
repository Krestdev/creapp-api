import { Router } from "express";
import requestRouter from "./requestRoutes";
import CmdRequestRoute from "./cmdReqstRoutes";
import ProviderRoute from "./providerRoutes";
export function connectRequestRoutes() {
  const router = Router();
  const request = new requestRouter();
  const cmdRequest = new CmdRequestRoute();
  const providerRequest = new ProviderRoute();

  // request routes connection
  router.use("/object", request.routes);

  // command request connection
  router.use("/cmdrqst", cmdRequest.routes);

  // command request connection
  router.use("/provider", providerRequest.routes);

  // command request connection
  router.use("/payment", providerRequest.routes);

  // command request connection
  router.use("/paymentTicket", providerRequest.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
