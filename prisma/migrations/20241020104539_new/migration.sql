/*
  Warnings:

  - You are about to drop the `Paste` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Paste";

-- CreateTable
CREATE TABLE "paste" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "visibility" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "paste_pkey" PRIMARY KEY ("id")
);
