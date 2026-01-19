import { Request } from "express";
import { mkdirSync } from "fs";
import multer from "multer";
import path from "path";

// Set up storage configuration
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    const entity = req.baseUrl.split("/").pop();

    const folder = `uploads/${entity}`;

    mkdirSync(folder, { recursive: true });

    cb(null, folder); // Ensure this folder exists
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});

export default upload;
