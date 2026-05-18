import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import PaymentController, { AccountantPaymentQueryParameter, DGPaymentQueryParameter, PaymentQueryOptions, PaymentQueryParameter, PaymentSignQueryParameter } from "./payment.Controller";
import upload from "../../utils/upload";
import { requireRole } from "../../middlewares/rbac.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class PaymentRoute {
  routes: Router = Router();
  paymentController = new PaymentController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // create
    this.routes.post(
      "/",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.paymentController
          .create({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    this.routes.post(
      "/depense",
      upload.fields([
        { name: "proof", maxCount: 5 },
        { name: "justification", maxCount: 5 },
      ]),
      (req, res) => {
        this.paymentController
          .createDepense({ ...req.body, ...(req.files ?? null) })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put(
      "/validate/:id",
      upload.fields([{ name: "signeDoc", maxCount: 5 }]),
      requireRole("USER"),
      (req, res) => {
        this.paymentController
          .validate(req.params.id!, { ...req.body, ...(req.files ?? null) })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put(
      "/payment/:id",
      upload.fields([
        { name: "proof", maxCount: 5 },
        { name: "justification", maxCount: 5 },
      ]),
      (req, res) => {
        this.paymentController
          .updateTransportPayment(req.params.id!, req.body)
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put(
      "/:id",
      upload.fields([
        { name: "proof", maxCount: 5 },
        { name: "justification", maxCount: 5 },
      ]),
      (req, res) => {
        this.paymentController
          .update(req.params.id!, {
            ...req.body,
            ...req.files,
          })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put("/gas/:id", (req, res) => {
      this.paymentController
        .updateGas(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update
    this.routes.put("/settle/:id", (req, res) => {
      this.paymentController
        .updateSettle(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.paymentController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/tickets-pending/count", requireRole("USER"), (req, res) => {
      this.paymentController
        .getTicketsPendingCount()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/paymentToTreat/count", requireRole("USER"), (req, res) => {
      this.paymentController
        .getPaymentToTreatCount()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/paymentToSign/count", requireRole("USER"), (req, res) => {
      this.paymentController
        .getPaymentToSignCount(req.user?.userId!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/paymentToSign/all", requireRole("USER"), (req, res) => {
      this.paymentController
        .getPaymentToSign(req.user?.userId!, req.query as unknown as PaymentSignQueryParameter)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/paymentToSign/stats", requireRole("USER"), (req, res) => {
      this.paymentController
        .getPaymentToSignStats(req.user?.userId!, req.query as unknown as PaymentSignQueryParameter)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/expenses/all", requireRole("USER"), (req, res) => {
      this.paymentController
        .getExpenses(req.query as unknown as PaymentQueryParameter)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/expenses/stats", requireRole("USER"), (req, res) => {
      this.paymentController
        .getExpensesStats(req.query as unknown as PaymentQueryParameter)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/expenses/accountant", requireRole("USER"), (req, res) => {
      this.paymentController
        .getExpensesAccountant(req.query as unknown as AccountantPaymentQueryParameter)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/expenses/accountant/stats", requireRole("USER"), (req, res) => {
      this.paymentController
        .getExpensesAccountantStats(req.query as unknown as AccountantPaymentQueryParameter)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/expenses/dg", requireRole("USER"), (req, res) => {
      this.paymentController
        .getExpensesDG(req.query as unknown as DGPaymentQueryParameter)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/expenses/dg/stats", requireRole("USER"), (req, res) => {
      this.paymentController
        .getExpensesDGStats(req.query as unknown as DGPaymentQueryParameter)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.get("/board/payments/chart", requireRole("USER"), (req, res) => {
      this.paymentController
        .getBoardPaymentChart()
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.paymentController
        .getAll(req.query as unknown as PaymentQueryOptions)
        .then((response) =>
          res
            .status(200)
            .json({
              message: create.success.create,
              data: response
            }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.paymentController
        .getOne(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/request/:requestId", requireRole("USER"), (req, res) => {
      this.paymentController
        .getOneByRequestId(req.params.requestId ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.post("/paymentProof/:id", requireRole("USER"), (req, res) => {
      this.paymentController
        .paymentProof(req.params.id ?? "-1", req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
