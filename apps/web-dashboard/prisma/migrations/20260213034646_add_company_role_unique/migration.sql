/*
  Warnings:

  - A unique constraint covering the columns `[company,role]` on the table `JobApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_company_role_key" ON "JobApplication"("company", "role");
