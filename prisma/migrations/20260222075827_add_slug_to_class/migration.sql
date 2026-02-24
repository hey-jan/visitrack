/*
  Warnings:

  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ClassToStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `classId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `schedNo` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `units` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructorId` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_ClassToStudent_B_index";

-- DropIndex
DROP INDEX "_ClassToStudent_AB_unique";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "email" TEXT;
ALTER TABLE "Student" ADD COLUMN "imageUrl" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Teacher";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ClassToStudent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "FacialData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacialData_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("studentId", "classId"),
    CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "confidence" REAL,
    "snapshotUrl" TEXT,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("createdAt", "id", "status", "studentId", "time", "updatedAt") SELECT "createdAt", "id", "status", "studentId", "time", "updatedAt" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "units" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("createdAt", "days", "id", "name", "room", "schedule", "time", "updatedAt") SELECT "createdAt", "days", "id", "name", "room", "schedule", "time", "updatedAt" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
CREATE UNIQUE INDEX "Class_slug_key" ON "Class"("slug");
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseNo" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Course" ("courseName", "courseNo", "createdAt", "id", "updatedAt") SELECT "courseName", "courseNo", "createdAt", "id", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "Instructor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_classId_date_key" ON "Session"("classId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
