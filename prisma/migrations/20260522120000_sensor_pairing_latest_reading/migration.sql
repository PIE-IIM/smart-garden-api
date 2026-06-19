-- Add ownership/provisioning metadata to sensors.
ALTER TABLE "sensors" ADD COLUMN "hardware_id" TEXT;
ALTER TABLE "sensors" ADD COLUMN "userId" TEXT;
ALTER TABLE "sensors" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Track updates on the single retained reading row.
ALTER TABLE "sensor_readings" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Keep only the most recent reading per sensor before enforcing one-row storage.
DELETE FROM "sensor_readings"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "sensor_id"
        ORDER BY "created_at" DESC, "id" DESC
      ) AS row_number
    FROM "sensor_readings"
  ) ranked_readings
  WHERE ranked_readings.row_number > 1
);

-- New constraints/indexes for claiming sensors and storing only the latest reading.
CREATE UNIQUE INDEX "sensors_hardware_id_key" ON "sensors"("hardware_id");
CREATE INDEX "sensors_userId_idx" ON "sensors"("userId");
CREATE INDEX "sensors_userId_type_idx" ON "sensors"("userId", "type");
CREATE UNIQUE INDEX "sensor_readings_sensor_id_key" ON "sensor_readings"("sensor_id");

ALTER TABLE "sensors" ADD CONSTRAINT "sensors_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
