-- CreateTable
CREATE TABLE "GenerationRequest" (
    "id" SERIAL NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "industry" TEXT,
    "keyWords" TEXT,
    "tone" TEXT,
    "numWords" INTEGER,
    "fullTextPrompt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseText" TEXT,

    CONSTRAINT "GenerationRequest_pkey" PRIMARY KEY ("id")
);
