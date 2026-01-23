import { Router } from "express";
import UserRouter from "../user/user.Route";
import projectRouter from "../project/project.Routes";
import CmdRequestRoute from "../commandrequest/cmdReqst.Routes";
import ProviderRoute from "../provider/provider.Routes";
import PaymentRoute from "../payment/payment.Routes";
import AccountingRoute from "../accounting/accounting.Routes";
import SpendingRoute from "../spending/spending.Routes";
import DeviRoute from "../devi/devi.Routes";
import CommandRoute from "../command/command.Routes";
import RequestRoute from "../request/request.Routes";
import CategoryRoute from "../category/category.Routes";
import ValidatorRoute from "../validator/validator.Routes";
import ReceptionRoute from "../reception/reception.Routes";
import BankRoute from "../bank/bank.Routes";
import NotificationRoute from "../notification/notification.Routes";
import TransactionRoute from "../transaction/transaction.Routes";
import VehicleRoute from "../vehicle/vehicle.Routes";
import RequestTypeRoute from "../requesttype/requestType.Routes";
import PayTypeRoute from "../payType/payType.Routes";
import SignatairRoute from "../signatair/signatair.Routes";
import AuthRoute from "../auth/auth.routes";
import DriverRoute from "../driver/driver.Routes";

export function connectBaseRoutes() {
  const router = Router();
  const userRouter = new UserRouter();
  const authRoute = new AuthRoute();

  // user routes connection
  router.use("/user", userRouter.routes);

  router.use("/auth", authRoute.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}

export function connectProjectRoutes() {
  const router = Router();
  const project = new projectRouter();

  // project routes connection
  router.use("/management", project.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Project Module" });
  });

  return router;
}

export function connectRequestRoutes() {
  const router = Router();
  const request = new RequestRoute();
  const cmdRequest = new CmdRequestRoute();
  const providerRequest = new ProviderRoute();
  const paymentRoute = new PaymentRoute();
  const accountingRoute = new AccountingRoute();
  const spendingRoute = new SpendingRoute();
  const deviRoute = new DeviRoute();
  const commandRoute = new CommandRoute();
  const categoryRoute = new CategoryRoute();
  const validatorRoute = new ValidatorRoute();
  const receptionRoute = new ReceptionRoute();
  const bankRoute = new BankRoute();
  const notificationRoute = new NotificationRoute();
  const transactionRoute = new TransactionRoute();
  const vehicleRoute = new VehicleRoute();
  const requestType = new RequestTypeRoute();
  const payTypeRoute = new PayTypeRoute();
  const signatairRoute = new SignatairRoute();
  const driverRoute = new DriverRoute();

  // request routes connection
  router.use("/object", request.routes);

  // category routes connection
  router.use("/category", categoryRoute.routes);

  // validator routes connection
  router.use("/validator", validatorRoute.routes);

  // command request connection
  router.use("/cmdrqst", cmdRequest.routes);

  // command request connection
  router.use("/provider", providerRequest.routes);

  // command request connection
  router.use("/spending", spendingRoute.routes);

  // command request connection
  router.use("/accounting", accountingRoute.routes);

  // command request connection
  router.use("/payment", paymentRoute.routes);

  // command request connection
  router.use("/devi", deviRoute.routes);

  // command request connection
  router.use("/command", commandRoute.routes);

  // reception request connection
  router.use("/reception", receptionRoute.routes);

  // bank request connection
  router.use("/bank", bankRoute.routes);

  // bank request connection
  router.use("/notification", notificationRoute.routes);

  // transaction request connection
  router.use("/transaction", transactionRoute.routes);

  // vehicle request connection
  router.use("/vehicle", vehicleRoute.routes);

  // vehicle request connection
  router.use("/requestType", requestType.routes);

  // Signatair request connection
  router.use("/signatair", signatairRoute.routes);

  // PayType request connection
  router.use("/payType", payTypeRoute.routes);

  // Chauffeur request connection
  router.use("/driver", driverRoute.routes);

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
