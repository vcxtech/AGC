-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "paystack_id" VARCHAR(100),
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "channel" VARCHAR(50),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_reference_key" ON "donations"("reference");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_created_at_idx" ON "donations"("created_at");

-- CreateIndex
CREATE INDEX "donations_email_idx" ON "donations"("email");
