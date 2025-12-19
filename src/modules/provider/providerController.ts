import { Body, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { ProviderService } from "./providerService";
import { Provider } from "@prisma/client";

const cmdRequestService = new ProviderService();

export type MyFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: 93272;
}[];

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
      carte_contribuable: MyFile | null;
      acf: MyFile | null;
      plan_localisation: MyFile | null;
      commerce_registre: MyFile | null;
      banck_attestation: MyFile | null;
    }
  ): Promise<Provider> {
    const newProvider = {
      ...data,
      carte_contribuable:
        data.carte_contribuable && data.carte_contribuable[0]
          ? data.carte_contribuable[0].filename
          : null,
      acf: data.acf && data.acf[0] ? data.acf[0].filename : null,
      plan_localisation:
        data.plan_localisation && data.plan_localisation[0]
          ? data.plan_localisation[0].filename
          : null,
      commerce_registre:
        data.commerce_registre && data.commerce_registre[0]
          ? data.commerce_registre[0].filename
          : null,
      banck_attestation:
        data.banck_attestation && data.banck_attestation[0]
          ? data.banck_attestation[0].filename
          : null,
    };

    return cmdRequestService.create(newProvider);
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
      carte_contribuable: MyFile | null;
      acf: MyFile | null;
      plan_localisation: MyFile | null;
      commerce_registre: MyFile | null;
      banck_attestation: MyFile | null;
    }
  ): Promise<Provider> {
    const newProvider = {
      ...data,
      carte_contribuable:
        data.carte_contribuable && data.carte_contribuable[0]
          ? data.carte_contribuable[0].filename
          : null,
      acf: data.acf && data.acf[0] ? data.acf[0].filename : null,
      plan_localisation:
        data.plan_localisation && data.plan_localisation[0]
          ? data.plan_localisation[0].filename
          : null,
      commerce_registre:
        data.commerce_registre && data.commerce_registre[0]
          ? data.commerce_registre[0].filename
          : null,
      banck_attestation:
        data.banck_attestation && data.banck_attestation[0]
          ? data.banck_attestation[0].filename
          : null,
    };

    return cmdRequestService.update(Number(id), newProvider);
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
