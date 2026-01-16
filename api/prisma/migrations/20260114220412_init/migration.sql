-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL DEFAULT 'Caminhão VUC',
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);
