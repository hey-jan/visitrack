/*
  Warnings:

  - A unique constraint covering the columns `[studentNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN "studentNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");
