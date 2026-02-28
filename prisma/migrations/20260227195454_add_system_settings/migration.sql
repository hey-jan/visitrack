-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "lateThreshold" INTEGER NOT NULL DEFAULT 15,
    "absentThreshold" INTEGER NOT NULL DEFAULT 30,
    "autoMarkAbsent" BOOLEAN NOT NULL DEFAULT true,
    "confidenceScore" REAL NOT NULL DEFAULT 0.80,
    "updatedAt" DATETIME NOT NULL
);
