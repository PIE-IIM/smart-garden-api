-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" BIGSERIAL NOT NULL,
    "sensor_id" UUID NOT NULL,
    "value_numeric" DOUBLE PRECISION NOT NULL,
    "raw_value" INTEGER,
    "voltage" DOUBLE PRECISION,
    "recorded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '%',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "write_token" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_readings_sensor_created" ON "sensor_readings"("sensor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_readings_sensor_recorded" ON "sensor_readings"("sensor_id", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sensors_write_token_key" ON "sensors"("write_token");

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
