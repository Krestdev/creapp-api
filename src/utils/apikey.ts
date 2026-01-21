import crypto from "crypto";

export function generateApiKey() {
  const publicId = crypto.randomBytes(8).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");

  const rawKey = `pk_live_${publicId}.${secret}`;

  const hashedSecret = crypto.createHash("sha256").update(secret).digest("hex");

  return {
    rawKey, // send once to client
    publicId, // store in DB
    hashedSecret, // store in DB
  };
}
