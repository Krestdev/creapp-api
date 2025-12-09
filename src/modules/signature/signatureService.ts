import { Signature, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SignatureService {
  // Create
  create = (data: Signature) => {
    return prisma.signature.create({
      data,
    });
  };

  // Update
  update = (id: number, data: Signature) => {
    return prisma.signature.update({
      where: { id },
      data,
    });
  };

  // Delete
  delete = (id: number) => {
    return prisma.signature.delete({
      where: { id },
    });
  };

  // Get all
  getAll = () => {
    return prisma.signature.findMany();
  };

  // Get one
  getOne = (id: number) => {
    return prisma.signature.findUniqueOrThrow({
      where: { id },
    });
  };
}
