/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_slug_key" ON "Student"("slug");
