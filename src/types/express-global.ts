import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;

      // For upload.array(), upload.fields()
      files?:
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | Express.Multer.File[];

      // For upload.single()
      file?: Express.Multer.File;
    }
  }
}

// // Export empty object to make this a module
export {};
