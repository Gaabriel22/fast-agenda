/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SaasPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SaasPlan_name_key" ON "public"."SaasPlan"("name");
