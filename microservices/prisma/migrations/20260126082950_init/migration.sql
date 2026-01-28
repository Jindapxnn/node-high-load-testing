-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "queue_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_queue_number_key" ON "bookings"("queue_number");
