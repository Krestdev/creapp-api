-- DropForeignKey
ALTER TABLE "public"."Command" DROP CONSTRAINT "Command_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommandRequest" DROP CONSTRAINT "CommandRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeviElement" DROP CONSTRAINT "DeviElement_deviId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_paymentTicketId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestModel" DROP CONSTRAINT "RequestModel_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestValidation" DROP CONSTRAINT "RequestValidation_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestValidation" DROP CONSTRAINT "RequestValidation_validatorId_fkey";

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestValidation" ADD CONSTRAINT "RequestValidation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestValidation" ADD CONSTRAINT "RequestValidation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandRequest" ADD CONSTRAINT "CommandRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviElement" ADD CONSTRAINT "DeviElement_deviId_fkey" FOREIGN KEY ("deviId") REFERENCES "Devi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentTicketId_fkey" FOREIGN KEY ("paymentTicketId") REFERENCES "PaymentTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
