/*
  Warnings:

  - You are about to drop the column `valid_to` on the `RfidTag` table. All the data in the column will be lost.
  - Added the required column `valid_until` to the `RfidTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RfidTag" DROP COLUMN "valid_to",
ADD COLUMN     "valid_until" TIMESTAMP(3) NOT NULL;
