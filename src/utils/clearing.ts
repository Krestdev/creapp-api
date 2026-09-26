import { PayType } from "@prisma/client";

type MethodLike = Pick<PayType, "type" | "label"> | null | undefined;

// Payment methods whose funds are held in the bank's temporary account from
// signature until the bank clears (paid) or rejects them.
export const getClearingInstrument = (method: MethodLike) => {
  const type = method?.type?.toLowerCase();

  if (type === "chq" || !!method?.label?.toLowerCase().includes("chèque")) {
    return { kind: "chq", label: "Chèque" } as const;
  }

  if (type === "ov") {
    return { kind: "ov", label: "Ordre de virement" } as const;
  }

  return null;
};
