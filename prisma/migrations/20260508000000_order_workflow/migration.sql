-- CreateEnum
CREATE TYPE "OrderConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "confirmationStatus" "OrderConfirmationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "stockCommitted" BOOLEAN NOT NULL DEFAULT false;

-- Existing orders were created before confirmation-based stock handling, so treat their stock as already committed.
UPDATE "Order" SET "stockCommitted" = true;
