import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import TransactionController from "./transaction.Controller";
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

export default class TransactionRoute {
  routes: Router = Router();
  trTransactionController = new TransactionController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // create

    // create transaction CREDIT
    this.routes.post(
      "/credit",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .createCreditTransaction({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // create transaction DEBIT
    this.routes.post(
      "/debit",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .createDebitTransaction({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // create transaction DEBIT and PAYMENT
    this.routes.post(
      "/debitPayment",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .createDebitPayment({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // create transaction TRANSFER
    this.routes.post("/transferTransaction", (req, res) => {
      this.trTransactionController
        .createTransfer(req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    this.routes.post(
      "/appro",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .createApprovisionement(req.body)
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update

    // transfer update
    this.routes.put(
      "/transferUpdate/:id",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .updateTransfer(req.params.id!, { ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // transfer update
    this.routes.put(
      "/transferComplete/:id",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .completeTransfer(req.params.id!, { ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // payment update to paid
    this.routes.put(
      "/paymentUpdate/:id",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .updatePayment(req.params.id!, { ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // initiate sign
    this.routes.put("/initiateSign/:id", (req, res) => {
      this.trTransactionController
        .updateSign(req.params.id, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update
    this.routes.put(
      "/sign/:id",
      authenticate,
      upload.fields([{ name: "signDoc", maxCount: 5 }]),
      (req, res) => {
        this.trTransactionController
          .sign(req.params.id!, {
            ...req.body,
            ...req.files,
            userId: req.user?.userId ?? null,
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
    this.routes.put("/validate/:id", requireRole("USER"), (req, res) => {
      this.trTransactionController
        .validate(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/:id", requireRole("USER"), (req, res) => {
      this.trTransactionController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.trTransactionController
        .getAll()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.trTransactionController
        .getOne(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
