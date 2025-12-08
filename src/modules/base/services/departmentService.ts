import { Department, Member, PrismaClient } from "@prisma/client";
import { department } from "../../../../assets/messages/departmentMessages.json";

const { add_final_validator, add_validator, add_member } = department;

const prisma = new PrismaClient();

export class DepartmentService {
  async create(
    data: Omit<Department, "createdAt" | "updatedAt"> & { chiefId: number }
  ) {
    const { chiefId, ...ndata } = data;
    return prisma.department.create({
      data: {
        ...ndata,
        status: "active",
        members: {
          create: {
            label: "chief",
            userId: chiefId,
            finalValidator: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Partial<Omit<Department, "createdAt" | "updatedAt">> & {
      members: Member[];
    }
  ) {
    const { members, ...department } = data;

    const existing = members.filter((e) => !!e.id);
    const toCreate = members.filter((e) => !e.id);
    const existingIds = existing.map((e) => e.id);

    const updateData: any = {};
    if (department.label !== undefined) updateData.label = department.label;
    if (department.description !== undefined)
      updateData.description = department.description;

    return prisma.department.update({
      where: { id },
      data: {
        ...updateData,
        ...data,
        members: {
          deleteMany: {
            departmentId: id,
            id: { notIn: existingIds },
          },
          updateMany: existing.map((e) => ({
            where: { id: e.id },
            data: {
              label: e.label,
              validator: e.validator,
              chief: e.chief,
              finalValidator: e.finalValidator,
            },
          })),
          create: toCreate.map((e) => ({
            label: e.label,
            validator: e.validator,
            chief: e.chief,
            finalValidator: e.finalValidator,
            userId: e.userId,
          })),
        },
      },
    });
  }

  delete(id: number) {
    return prisma.department.delete({
      where: { id },
    });
  }

  getAll() {
    return prisma.department.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  getOne(id: number) {
    return prisma.department.findUnique({
      where: { id },
    });
  }

  getMembers(departmentId: number) {
    return prisma.member.findMany({
      where: { departmentId },
    });
  }

  async addMember(
    departmentId: number,
    userId: number,
    validator = false,
    label = "member"
  ) {
    const member = await prisma.member.findFirst({
      where: { departmentId, userId },
    });
    if (member) {
      throw new Error(add_member.error.already_member);
    }
    return prisma.member.create({
      data: {
        label,
        department: { connect: { id: departmentId } },
        user: { connect: { id: userId } },
        validator,
      },
    });
  }

  removeMember(departmentId: number, userId: number) {
    return prisma.member.deleteMany({
      where: { departmentId, userId },
    });
  }

  getValidators(departmentId: number) {
    return prisma.member.findMany({
      where: { departmentId, validator: true },
    });
  }

  removeValidator(departmentId: number, userId: number) {
    return prisma.member.updateMany({
      where: { departmentId, userId },
      data: {
        validator: false,
      },
    });
  }

  async addFinalValidator(departmentId: number, userId: number) {
    // find amongst existing member if the user is already a member
    const member = await prisma.member.findFirst({
      where: { departmentId, userId },
    });
    if (member) {
      return prisma.member.update({
        where: {
          id: member.id,
        },
        data: {
          label: "final_validator",
          validator: false,
          finalValidator: true,
        },
      });
    } else {
      throw new Error(add_final_validator.error.not_member);
    }
  }

  removeFinalValidator(departmentId: number, userId: number) {
    return prisma.member.updateMany({
      where: { departmentId, userId },
      data: {
        finalValidator: false,
      },
    });
  }

  getFinalValidators(departmentId: number) {
    return prisma.member.findMany({
      where: { departmentId, finalValidator: true },
    });
  }

  async addValidator(departmentId: number, userId: number) {
    const member = await prisma.member.findFirst({
      where: { departmentId, userId },
    });
    if (member) {
      return prisma.member.update({
        where: { id: member.id },
        data: {
          label: "validator",
          department: { connect: { id: departmentId } },
          user: { connect: { id: userId } },
          validator: true,
        },
      });
    } else {
      throw new Error(add_validator.error.not_member);
    }
  }

  setDepartmentChief(departmentId: number, userId: number) {
    return prisma.member.updateMany({
      where: { departmentId, userId },
      data: {
        label: "chief",
        chief: true,
      },
    });
  }

  unsetDepartmentChief(departmentId: number, userId: number) {
    return prisma.member.updateMany({
      where: { departmentId, userId },
      data: {
        label: "member",
        chief: false,
      },
    });
  }
}
