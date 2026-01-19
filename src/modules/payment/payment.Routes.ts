import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import PaymentController from "./payment.Controller";
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
    this.routes.put("/validate/:id", requireRole("USER"), (req, res) => {
      this.paymentController
        .validate(req.params.id!, req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

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

    // getAll
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.paymentController
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
      this.paymentController
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
