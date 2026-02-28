-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT,
    "imageUrl" TEXT,
    "slug" TEXT,
    CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("courseId", "createdAt", "email", "firstName", "id", "imageUrl", "lastName", "section", "slug", "studentNumber", "updatedAt", "year") SELECT "courseId", "createdAt", "email", "firstName", "id", "imageUrl", "lastName", "section", "slug", "studentNumber", "updatedAt", "year" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
CREATE UNIQUE INDEX "Student_slug_key" ON "Student"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
