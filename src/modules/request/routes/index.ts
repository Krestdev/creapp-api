import { Router } from "express";
import requestRouter from "./requestRoutes";
import CmdRequestRoute from "./cmdReqstRoutes";
import ProviderRoute from "./providerRoutes";
import PaymentRoute from "./paymentRoutes";
import PaymentTicketRoute from "./paymentTicketRoutes";
import AccountingRoute from "./accountingRoutes";
import SpendingRoute from "./spendingRoutes";
import SignatureRoute from "./signatureRoutes";
import DeviRoute from "./deviRoutes";
import CommandRoute from "./commandRoutes";

export function connectRequestRoutes() {
  const router = Router();
  const request = new requestRouter();
  const cmdRequest = new CmdRequestRoute();
  const providerRequest = new ProviderRoute();
  const paymentRoute = new PaymentRoute();
  const paymentTicketRoute = new PaymentTicketRoute();
  const accountingRoute = new AccountingRoute();
  const spendingRoute = new SpendingRoute();
  const signatureRoute = new SignatureRoute();
  const deviRoute = new DeviRoute();
  const commandRoute = new CommandRoute();

  // request routes connection
  router.use("/object", request.routes);

  // command request connection
  router.use("/cmdrqst", cmdRequest.routes);

  // command request connection
  router.use("/provider", providerRequest.routes);

  // command request connection
  router.use("/signature", signatureRoute.routes);

  // command request connection
  router.use("/spending", spendingRoute.routes);

  // command request connection
  router.use("/accounting", accountingRoute.routes);

  // command request connection
  router.use("/payment", paymentRoute.routes);

  // command request connection
  router.use("/paymentTicket", paymentTicketRoute.routes);

  // command request connection
  router.use("/devi", deviRoute.routes);

  // command request connection
  router.use("/command", commandRoute.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
