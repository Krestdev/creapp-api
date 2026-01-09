import { Router } from "express";
import UserRouter from "../user/userRoute";
import DepartmentRouter from "../department/departmentRoute";
import projectRouter from "../project/projectRoutes";
import CmdRequestRoute from "../commandrequest/cmdReqstRoutes";
import ProviderRoute from "../provider/providerRoutes";
import PaymentRoute from "../payment/paymentRoutes";
import AccountingRoute from "../accounting/accountingRoutes";
import SpendingRoute from "../spending/spendingRoutes";
import SignatureRoute from "../signature/signatureRoutes";
import DeviRoute from "../devi/deviRoutes";
import CommandRoute from "../command/commandRoutes";
import RequestRoute from "../request/requestRoutes";
import CategoryRoute from "../category/categoryRoutes";
import ValidatorRoute from "../validator/validatorRoutes";
import ReceptionRoute from "../reception/receptionRoutes";
import BankRoute from "../bank/bankRoutes";
import NotificationRoute from "../notification/notificationRoutes";
import TransactionRoute from "../transaction/transactionRoutes";
import VehicleRoute from "../vehicle/vehicleRoutes";
import RequestTypeRoute from "../requesttype/requestTypeRoutes";

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
  const signatureRoute = new SignatureRoute();
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
  router.use("/signature", signatureRoute.routes);

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

  // base module connection
  router.use("/", (req, res) => {
    res.json({ message: "Request Module" });
  });

  return router;
}
