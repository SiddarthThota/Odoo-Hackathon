CREATE TYPE "OperationStatus" AS ENUM ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED');
CREATE TYPE "OperationType" AS ENUM ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT');

CREATE TABLE "DocumentCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentCounter_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "Receipt" (
    "id" UUID NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "supplierRef" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "validatedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "validatedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Receipt_referenceNo_key" ON "Receipt"("referenceNo");
CREATE INDEX "Receipt_status_idx" ON "Receipt"("status");
CREATE INDEX "Receipt_warehouseId_idx" ON "Receipt"("warehouseId");
CREATE INDEX "Receipt_scheduledDate_idx" ON "Receipt"("scheduledDate");
CREATE INDEX "Receipt_createdAt_idx" ON "Receipt"("createdAt");

CREATE TABLE "ReceiptLine" (
    "id" UUID NOT NULL,
    "receiptId" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "expectedQty" DECIMAL(15,3) NOT NULL,
    "receivedQty" DECIMAL(15,3),
    "unitOfMeasure" TEXT NOT NULL,
    CONSTRAINT "ReceiptLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReceiptLine_receiptId_idx" ON "ReceiptLine"("receiptId");
CREATE INDEX "ReceiptLine_productId_idx" ON "ReceiptLine"("productId");
ALTER TABLE "ReceiptLine" ADD CONSTRAINT "ReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Delivery" (
    "id" UUID NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "customerRef" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "pickedAt" TIMESTAMP(3),
    "packedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "validatedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Delivery_referenceNo_key" ON "Delivery"("referenceNo");
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");
CREATE INDEX "Delivery_warehouseId_idx" ON "Delivery"("warehouseId");
CREATE INDEX "Delivery_scheduledDate_idx" ON "Delivery"("scheduledDate");
CREATE INDEX "Delivery_createdAt_idx" ON "Delivery"("createdAt");

CREATE TABLE "DeliveryLine" (
    "id" UUID NOT NULL,
    "deliveryId" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "expectedQty" DECIMAL(15,3) NOT NULL,
    "deliveredQty" DECIMAL(15,3),
    "unitOfMeasure" TEXT NOT NULL,
    "pickedAt" TIMESTAMP(3),
    "packedAt" TIMESTAMP(3),
    CONSTRAINT "DeliveryLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DeliveryLine_deliveryId_idx" ON "DeliveryLine"("deliveryId");
CREATE INDEX "DeliveryLine_productId_idx" ON "DeliveryLine"("productId");
ALTER TABLE "DeliveryLine" ADD CONSTRAINT "DeliveryLine_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Transfer" (
    "id" UUID NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "sourceLocationId" TEXT NOT NULL,
    "destinationLocationId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Transfer_referenceNo_key" ON "Transfer"("referenceNo");
CREATE INDEX "Transfer_status_idx" ON "Transfer"("status");
CREATE INDEX "Transfer_sourceLocationId_idx" ON "Transfer"("sourceLocationId");
CREATE INDEX "Transfer_destinationLocationId_idx" ON "Transfer"("destinationLocationId");
CREATE INDEX "Transfer_createdAt_idx" ON "Transfer"("createdAt");

CREATE TABLE "TransferLine" (
    "id" UUID NOT NULL,
    "transferId" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    CONSTRAINT "TransferLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransferLine_transferId_idx" ON "TransferLine"("transferId");
CREATE INDEX "TransferLine_productId_idx" ON "TransferLine"("productId");
ALTER TABLE "TransferLine" ADD CONSTRAINT "TransferLine_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Adjustment" (
    "id" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "recordedQty" DECIMAL(15,3) NOT NULL,
    "countedQty" DECIMAL(15,3) NOT NULL,
    "delta" DECIMAL(15,3) NOT NULL,
    "reason" TEXT,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "appliedBy" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Adjustment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Adjustment_status_idx" ON "Adjustment"("status");
CREATE INDEX "Adjustment_productId_idx" ON "Adjustment"("productId");
CREATE INDEX "Adjustment_locationId_idx" ON "Adjustment"("locationId");
CREATE INDEX "Adjustment_createdAt_idx" ON "Adjustment"("createdAt");

CREATE TABLE "MoveHistory" (
    "id" UUID NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "operationId" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "quantityDelta" DECIMAL(15,3) NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "performedBy" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoveHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MoveHistory_operationType_operationId_idx" ON "MoveHistory"("operationType", "operationId");
CREATE INDEX "MoveHistory_productId_idx" ON "MoveHistory"("productId");
CREATE INDEX "MoveHistory_occurredAt_idx" ON "MoveHistory"("occurredAt");
CREATE INDEX "MoveHistory_fromLocationId_idx" ON "MoveHistory"("fromLocationId");
CREATE INDEX "MoveHistory_toLocationId_idx" ON "MoveHistory"("toLocationId");
CREATE UNIQUE INDEX "MoveHistory_operationType_operationId_productId_key" ON "MoveHistory"("operationType", "operationId", "productId");


CREATE OR REPLACE FUNCTION prevent_move_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'MoveHistory is append-only and cannot be modified';
END;
$$;

CREATE TRIGGER move_history_immutable
BEFORE UPDATE OR DELETE ON "MoveHistory"
FOR EACH ROW
EXECUTE FUNCTION prevent_move_history_mutation();
