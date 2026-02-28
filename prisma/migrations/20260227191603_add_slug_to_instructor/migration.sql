/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Instructor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_slug_key" ON "Instructor"("slug");
