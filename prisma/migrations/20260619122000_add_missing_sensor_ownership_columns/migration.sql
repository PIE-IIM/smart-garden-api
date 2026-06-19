-- Repair migration for environments where the sensor ownership columns were
-- not created even though previous sensor migrations are marked as applied.

ALTER TABLE "sensors" ADD COLUMN IF NOT EXISTS "hardware_id" TEXT;
ALTER TABLE "sensors" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "sensors_hardware_id_key" ON "sensors"("hardware_id");
CREATE INDEX IF NOT EXISTS "sensors_userId_idx" ON "sensors"("userId");
CREATE INDEX IF NOT EXISTS "sensors_userId_type_idx" ON "sensors"("userId", "type");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sensors_userId_fkey'
  ) THEN
    ALTER TABLE "sensors" ADD CONSTRAINT "sensors_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
