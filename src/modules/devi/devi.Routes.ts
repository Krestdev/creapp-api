import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import DeviController from "../devi/devi.Controller";
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

export default class DeviRoute {
  routes: Router = Router();
  deviController = new DeviController();

  constructor() {
    this.config();
  }

  private config() {
    this.routes.use(authenticate); // create
    // multiple files
    this.routes.post(
      "/",
      upload.fields([{ name: "proof", maxCount: 5 }]),
      (req, res) => {
        this.deviController
          .create({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request }),
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      },
    );

    // update
    this.routes.put("/validerDevis", requireRole("USER"), (req, res) => {
      this.deviController
        .validerDevis(req.body)
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
      upload.single("proof"),
      requireRole("USER"),
      (req, res) => {
        this.deviController
          .update(req.params.id!, req.body)
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
      this.deviController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/element/:id", requireRole("USER"), (req, res) => {
      this.deviController
        .deleteElement(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // delete
    this.routes.delete("/element/", requireRole("USER"), (req, res) => {
      this.deviController
        .getAllElement()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", requireRole("USER"), (req, res) => {
      this.deviController
        .getAll()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/element/", requireRole("USER"), (req, res) => {
      this.deviController
        .getAllElement()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", requireRole("USER"), (req, res) => {
      this.deviController
        .getOne(req.params.id ?? "-1")
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // update devis element
    this.routes.put("/element/:id", requireRole("USER"), (req, res) => {
      this.deviController
        .updateDeviElement(req.params.id ?? "-1", req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // add devis element
    this.routes.put("/element/add/:id", requireRole("USER"), (req, res) => {
      this.deviController
        .addDeviElement(req.params.id ?? "-1", req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // add devis element
    this.routes.put("/element/remove/:id", requireRole("USER"), (req, res) => {
      this.deviController
        .removeElement(req.params.id ?? "-1", req.body)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request }),
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
