-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enrollment" (
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("studentId", "classId"),
    CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Enrollment" ("classId", "enrolledAt", "studentId") SELECT "classId", "enrolledAt", "studentId" FROM "Enrollment";
DROP TABLE "Enrollment";
ALTER TABLE "new_Enrollment" RENAME TO "Enrollment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
