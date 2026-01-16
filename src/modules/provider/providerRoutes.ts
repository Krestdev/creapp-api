import { Router } from "express";
import { request } from "../../../assets/messages/requestMessages.json";
import ProviderController from "./providerController";
import upload from "../../utils/upload";

const {
  create,
  // update,
  // delete_request,
  // get_all,
  // get_my_requests,
  // get_by_id
} = request;

export default class ProviderRoute {
  routes: Router = Router();
  providerController = new ProviderController();

  constructor() {
    this.config();
  }

  private config() {
    // create
    this.routes.post(
      "/",
      upload.fields([
        { name: "carte_contribuable", maxCount: 1 },
        { name: "acf", maxCount: 1 },
        { name: "plan_localisation", maxCount: 1 },
        { name: "commerce_registre", maxCount: 1 },
        { name: "banck_attestation", maxCount: 1 },
      ]),
      (req, res) => {
        this.providerController
          .create({ ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    // update
    this.routes.put(
      "/:id",
      upload.fields([
        { name: "carte_contribuable", maxCount: 1 },
        { name: "acf", maxCount: 1 },
        { name: "plan_localisation", maxCount: 1 },
        { name: "commerce_registre", maxCount: 1 },
        { name: "banck_attestation", maxCount: 1 },
      ]),
      (req, res) => {
        this.providerController
          .update(req.params.id!, { ...req.body, ...req.files })
          .then((request) =>
            res
              .status(200)
              .json({ message: create.success.create, data: request })
          )
          .catch((error) => res.status(400).json({ error: error.message }));
      }
    );

    // delete
    this.routes.delete("/:id", (req, res) => {
      this.providerController
        .delete(req.params.id!)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getAll
    this.routes.get("/", (req, res) => {
      this.providerController
        .getAll()
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });

    // getOne
    this.routes.get("/:id", (req, res) => {
      this.providerController
        .getOne(req.params.id)
        .then((request) =>
          res
            .status(200)
            .json({ message: create.success.create, data: request })
        )
        .catch((error) => res.status(400).json({ error: error.message }));
    });
  }
}
