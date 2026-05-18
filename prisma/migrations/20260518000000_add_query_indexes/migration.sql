CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_brand_idx" ON "Product"("brand");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");
CREATE INDEX IF NOT EXISTS "Product_rating_reviewCount_idx" ON "Product"("rating", "reviewCount");

CREATE INDEX IF NOT EXISTS "Review_productId_createdAt_idx" ON "Review"("productId", "createdAt");

CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_confirmationStatus_createdAt_idx" ON "Order"("confirmationStatus", "createdAt");

CREATE INDEX IF NOT EXISTS "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");
