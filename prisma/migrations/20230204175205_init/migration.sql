-- CreateTable
CREATE TABLE "GenerationRequest" (
    "id" SERIAL NOT NULL,
    "jobTitle" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255),
    "keyWords" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    "tone" VARCHAR(255),
    "numWords" INTEGER DEFAULT 200,
    "fullTextPrompt" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "responseText" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationRequest_pkey" PRIMARY KEY ("id")
);
