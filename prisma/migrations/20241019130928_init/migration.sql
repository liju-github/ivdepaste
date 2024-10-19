-- CreateTable
CREATE TABLE "Paste" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "language" TEXT NOT NULL,

    CONSTRAINT "Paste_pkey" PRIMARY KEY ("id")
);
