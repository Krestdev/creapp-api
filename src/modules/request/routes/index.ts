import { Router } from "express";
import requestRouter from "./requestRoutes";
import CmdRequestRoute from "./cmdReqstRoutes";
import ProviderRoute from "./providerRoutes";
import PaymentRoute from "./paymentRoutes";
import PaymentTicketRoute from "./paymentTicketRoutes";
import AccountingRoute from "./accountingRoutes";
export function connectRequestRoutes() {
  const router = Router();
  const request = new requestRouter();
  const cmdRequest = new CmdRequestRoute();
  const providerRequest = new ProviderRoute();
  const paymentRoute = new PaymentRoute();
  const paymentTicketRoute = new PaymentTicketRoute();
  const accountingRoute = new AccountingRoute();

  // request routes connection
  router.use("/object", request.routes);

  // command request connection
  router.use("/cmdrqst", cmdRequest.routes);

  // command request connection
  router.use("/provider", providerRequest.routes);

  // command request connection
  router.use("/accounting", accountingRoute.routes);

  // command request connection
  router.use("/payment", paymentRoute.routes);

  // command request connection
  router.use("/paymentTicket", paymentTicketRoute.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
