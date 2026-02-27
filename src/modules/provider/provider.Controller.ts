import { Provider } from "@prisma/client";
import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { isMulterFiles, normalizeFile } from "../../utils/serverUtils";
import { ProviderService } from "./provider.Service";

const cmdRequestService = new ProviderService();

@Route("request/provider")
@Tags("Provider Routes")
export default class CmdRequestController {
  @Post("/")
  create(
    @Body()
    data: Omit<
      Provider,
      | "carte_contribuable"
      | "plan_localisation"
      | "commerce_registre"
      | "banck_attestation"
    > & {
      carte_contribuable: Express.Multer.File[] | null;
      acf: Express.Multer.File[] | null;
      plan_localisation: Express.Multer.File[] | null;
      commerce_registre: Express.Multer.File[] | null;
      banck_attestation: Express.Multer.File[] | null;
    },
  ): Promise<Provider> {
    const {
      expireAtbanck_attestation,
      expireAtcarte_contribuable,
      expireAtcommerce_registre,
      expireAtplan_localisation,
      expireAtacf,
      ...ndata
    } = data;
    let newProvider = {
      ...ndata,
      carte_contribuable: normalizeFile(data.carte_contribuable),
      acf: normalizeFile(data.acf),
      plan_localisation: normalizeFile(data.plan_localisation),
      commerce_registre: normalizeFile(data.commerce_registre),
      banck_attestation: normalizeFile(data.banck_attestation),
      expireAtbanck_attestation: !!expireAtbanck_attestation
        ? expireAtbanck_attestation
        : undefined,
      expireAtcarte_contribuable: !!expireAtcarte_contribuable
        ? expireAtcarte_contribuable
        : undefined,
      expireAtacf: !!expireAtacf ? expireAtacf : undefined,
      expireAtplan_localisation: !!expireAtplan_localisation
        ? expireAtplan_localisation
        : undefined,
    };

    const files = {
      carte_contribuable: data.carte_contribuable
        ? data.carte_contribuable
        : null,
      acf: data.acf ? data.acf : null,
      plan_localisation: data.plan_localisation ? data.plan_localisation : null,
      commerce_registre: data.commerce_registre ? data.commerce_registre : null,
      banck_attestation: data.banck_attestation ? data.banck_attestation : null,
    };

    return cmdRequestService.create(newProvider, { ...files });
  }

  /**
   * @summary Update Command request
   */
  @Put("/{id}")
  update(
    @Path() id: string,
    @Body()
    data: Omit<
      Provider,
      | "carte_contribuable"
      | "plan_localisation"
      | "commerce_registre"
      | "banck_attestation"
    > & {
      carte_contribuable: Express.Multer.File[] | null;
      acf: Express.Multer.File[] | null;
      plan_localisation: Express.Multer.File[] | null;
      commerce_registre: Express.Multer.File[] | null;
      banck_attestation: Express.Multer.File[] | null;
    },
  ): Promise<Provider> {
    const {
      expireAtbanck_attestation,
      expireAtcarte_contribuable,
      expireAtcommerce_registre,
      expireAtplan_localisation,
      expireAtacf,
      ...ndata
    } = data;
    let newProvider = {
      ...ndata,
      carte_contribuable: normalizeFile(data.carte_contribuable),
      acf: normalizeFile(data.acf),
      plan_localisation: normalizeFile(data.plan_localisation),
      commerce_registre: normalizeFile(data.commerce_registre),
      banck_attestation: normalizeFile(data.banck_attestation),
      expireAtbanck_attestation: !!expireAtbanck_attestation
        ? expireAtbanck_attestation
        : undefined,
      expireAtcarte_contribuable: !!expireAtcarte_contribuable
        ? expireAtcarte_contribuable
        : undefined,
      expireAtacf: !!expireAtacf ? expireAtacf : undefined,
      expireAtplan_localisation: !!expireAtplan_localisation
        ? expireAtplan_localisation
        : undefined,
    };

    const files = {
      carte_contribuable: isMulterFiles(data.carte_contribuable)
        ? data.carte_contribuable
        : null,
      acf: isMulterFiles(data.acf) ? data.acf : null,
      plan_localisation: isMulterFiles(data.plan_localisation)
        ? data.plan_localisation
        : null,
      commerce_registre: isMulterFiles(data.commerce_registre)
        ? data.commerce_registre
        : null,
      banck_attestation: isMulterFiles(data.banck_attestation)
        ? data.banck_attestation
        : null,
    };

    return cmdRequestService.update(Number(id), newProvider, { ...files });
  }

  @Delete("/{id}")
  delete(@Path() id: string): Promise<Provider> {
    return cmdRequestService.delete(Number(id));
  }

  @Get("/valid")
  getValid(): Promise<Provider[]> {
    return cmdRequestService.getValidProviders();
  }

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Provider> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Provider[]> {
    return cmdRequestService.getAll();
  }
}
