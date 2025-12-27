-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "post" TEXT NOT NULL DEFAULT 'Employee',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastConnection" TIMESTAMP(3),
    "verificationOtp" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePages" (
    "id" SERIAL NOT NULL,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "RolePages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL DEFAULT 'none',
    "label" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "validator" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "chief" BOOLEAN NOT NULL DEFAULT false,
    "finalValidator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "reference" TEXT NOT NULL DEFAULT 'none',
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "description" TEXT DEFAULT 'Aucun description',
    "chiefId" INTEGER,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestValidation" (
    "id" SERIAL NOT NULL,
    "decision" TEXT NOT NULL,
    "validatorId" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,

    CONSTRAINT "RequestValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestModel" (
    "id" SERIAL NOT NULL,
    "ref" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "unit" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "amount" INTEGER,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "categoryId" INTEGER NOT NULL,
    "userId" INTEGER,
    "projectId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commandRequestId" INTEGER,
    "commandId" INTEGER,

    CONSTRAINT "RequestModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validator" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandRequest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "userId" INTEGER NOT NULL,
    "providerId" INTEGER,

    CONSTRAINT "CommandRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devi" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "proof" TEXT NOT NULL,
    "ref" TEXT NOT NULL DEFAULT 'none',
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "commandRequestId" INTEGER,
    "dueDate" TIMESTAMP(3),
    "commandId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviElement" (
    "id" SERIAL NOT NULL,
    "requestModelId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_SELECTED',
    "priceProposed" INTEGER NOT NULL,
    "deviId" INTEGER NOT NULL,

    CONSTRAINT "DeviElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "deliveryDelay" TIMESTAMP(3) NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "hasPenalties" BOOLEAN NOT NULL,
    "penaltyMode" TEXT NOT NULL,
    "amountBase" INTEGER NOT NULL,
    "motif" TEXT,
    "providerId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL DEFAULT 'none',
    "deviId" INTEGER,
    "status" TEXT DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "cmdRqstId" INTEGER,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "RCCM" TEXT,
    "NIU" TEXT,
    "regem" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "carte_contribuable" TEXT,
    "acf" TEXT,
    "plan_localisation" TEXT,
    "commerce_registre" TEXT,
    "banck_attestation" TEXT,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "proof" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "price" INTEGER NOT NULL,
    "userId" INTEGER,
    "commandId" INTEGER,
    "projectId" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accounting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accounting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spending" (
    "id" SERIAL NOT NULL,
    "totalSpending" DOUBLE PRECISION NOT NULL,
    "details" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoleToRolePages" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoleToRolePages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_userbeneficiary" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_userbeneficiary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CommandRequest_reference_key" ON "CommandRequest"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Devi_commandId_key" ON "Devi"("commandId");

-- CreateIndex
CREATE UNIQUE INDEX "Devi_providerId_commandRequestId_key" ON "Devi"("providerId", "commandRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Command_deviId_key" ON "Command"("deviId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_path_key" ON "Document"("path");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE INDEX "_RoleToRolePages_B_index" ON "_RoleToRolePages"("B");

-- CreateIndex
CREATE INDEX "_userbeneficiary_B_index" ON "_userbeneficiary"("B");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_chiefId_fkey" FOREIGN KEY ("chiefId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestValidation" ADD CONSTRAINT "RequestValidation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestValidation" ADD CONSTRAINT "RequestValidation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_commandRequestId_fkey" FOREIGN KEY ("commandRequestId") REFERENCES "CommandRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandRequest" ADD CONSTRAINT "CommandRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandRequest" ADD CONSTRAINT "CommandRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_commandRequestId_fkey" FOREIGN KEY ("commandRequestId") REFERENCES "CommandRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviElement" ADD CONSTRAINT "DeviElement_requestModelId_fkey" FOREIGN KEY ("requestModelId") REFERENCES "RequestModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviElement" ADD CONSTRAINT "DeviElement_deviId_fkey" FOREIGN KEY ("deviId") REFERENCES "Devi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_cmdRqstId_fkey" FOREIGN KEY ("cmdRqstId") REFERENCES "CommandRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spending" ADD CONSTRAINT "Spending_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToRolePages" ADD CONSTRAINT "_RoleToRolePages_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToRolePages" ADD CONSTRAINT "_RoleToRolePages_B_fkey" FOREIGN KEY ("B") REFERENCES "RolePages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userbeneficiary" ADD CONSTRAINT "_userbeneficiary_A_fkey" FOREIGN KEY ("A") REFERENCES "RequestModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userbeneficiary" ADD CONSTRAINT "_userbeneficiary_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
