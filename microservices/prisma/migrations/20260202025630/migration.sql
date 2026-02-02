/*
  Warnings:

  - You are about to drop the column `queue_number` on the `bookings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "bookings_queue_number_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "queue_number";
