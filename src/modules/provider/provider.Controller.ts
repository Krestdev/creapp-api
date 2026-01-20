import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ProviderService } from "./provider.Service";
import { Provider } from "@prisma/client";
import { getIO } from "../../socket";
import { isMulterFiles, normalizeFile } from "../../utils/serverUtils";

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
    const newProvider = {
      ...data,
      carte_contribuable:
        data.carte_contribuable && data.carte_contribuable[0]
          ? data.carte_contribuable[0].path.replace(/\\/g, "/")
          : null,
      acf:
        data.acf && data.acf[0] ? data.acf[0].path.replace(/\\/g, "/") : null,
      plan_localisation:
        data.plan_localisation && data.plan_localisation[0]
          ? data.plan_localisation[0].path.replace(/\\/g, "/")
          : null,
      commerce_registre:
        data.commerce_registre && data.commerce_registre[0]
          ? data.commerce_registre[0].path.replace(/\\/g, "/")
          : null,
      banck_attestation:
        data.banck_attestation && data.banck_attestation[0]
          ? data.banck_attestation[0].path.replace(/\\/g, "/")
          : null,
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
    const newProvider = {
      ...data,
      carte_contribuable: normalizeFile(data.carte_contribuable),
      acf: normalizeFile(data.acf),
      plan_localisation: normalizeFile(data.plan_localisation),
      commerce_registre: normalizeFile(data.commerce_registre),
      banck_attestation: normalizeFile(data.banck_attestation),
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

  @Get("/{id}")
  getOne(@Path() id: string): Promise<Provider> {
    return cmdRequestService.getOne(Number(id));
  }

  @Get("/")
  getAll(): Promise<Provider[]> {
    return cmdRequestService.getAll();
  }
}
