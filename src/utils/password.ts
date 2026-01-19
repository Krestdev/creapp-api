import bcrypt from "bcryptjs";
import { GENERAL_CONFIG } from "../config";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, GENERAL_CONFIG.bcrypt.saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
