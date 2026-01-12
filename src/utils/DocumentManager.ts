import {
  PrismaClient,
  Document,
  DocumentCategory,
  DocumentOwnerType,
} from "@prisma/client";
import fs from "fs/promises";

const prisma = new PrismaClient();

/* ---------------------------------------------------
   1️⃣ Store documents in bulk
--------------------------------------------------- */
export async function storeDocumentsBulk(
  files: Express.Multer.File[] | null,
  payload: {
    role: DocumentCategory;
    ownerId: string;
    ownerType: DocumentOwnerType;
  }
): Promise<Document[]> {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  return prisma.$transaction(
    files.map((file) =>
      prisma.document.create({
        data: {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          destination: file.destination,
          filename: file.filename,
          path: file.path,
          size: file.size,
          role: payload.role,
          ownerId: payload.ownerId,
          ownerType: payload.ownerType,
        },
      })
    )
  );
}

/* ---------------------------------------------------
   2️⃣ Update documents in bulk (replace files or role)
--------------------------------------------------- */
export async function updateDocumentsBulk(
  updates: {
    documentId: string;
    file?: Express.Multer.File;
    role?: DocumentCategory;
  }[]
): Promise<Document[]> {
  if (!updates || updates.length === 0) {
    throw new Error("No updates provided");
  }

  return prisma.$transaction(async (tx) => {
    const results: Document[] = [];

    for (const update of updates) {
      const existing = await tx.document.findUnique({
        where: { id: update.documentId },
      });

      if (!existing) {
        throw new Error(`Document not found: ${update.documentId}`);
      }

      // Replace file if provided
      if (update.file) {
        await fs.unlink(existing.path).catch(() => {});

        results.push(
          await tx.document.update({
            where: { id: update.documentId },
            data: {
              fieldname: update.file.fieldname,
              originalname: update.file.originalname,
              encoding: update.file.encoding,
              mimetype: update.file.mimetype,
              destination: update.file.destination,
              filename: update.file.filename,
              path: update.file.path,
              size: update.file.size,
              ...(update.role && { role: update.role }),
            },
          })
        );
      } else {
        // Metadata only
        results.push(
          await tx.document.update({
            where: { id: update.documentId },
            data: {
              ...(update.role && { role: update.role }),
            },
          })
        );
      }
    }

    return results;
  });
}

/* ---------------------------------------------------
   3️⃣ Delete ALL documents related to an owner
--------------------------------------------------- */
export async function deleteDocumentsByOwner(
  ownerId: string,
  ownerType: DocumentOwnerType
): Promise<number> {
  const documents = await prisma.document.findMany({
    where: { ownerId, ownerType },
  });

  if (documents.length === 0) return 0;

  await prisma.$transaction(
    documents.map((doc) => prisma.document.delete({ where: { id: doc.id } }))
  );

  await Promise.all(
    documents.map((doc) => fs.unlink(doc.path).catch(() => {}))
  );

  return documents.length;
}

/* ---------------------------------------------------
   4️⃣ Delete a specific document
--------------------------------------------------- */
export async function deleteDocument(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  await prisma.document.delete({
    where: { id: documentId },
  });

  await fs.unlink(document.path).catch(() => {});
}
