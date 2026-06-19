import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { Request, Response, Router } from "express";
import {
  AuthRequest,
  authenticateToken,
} from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

let sensorData = {
  temperature: null as number | null,
  humidite: null as number | null,
  pourcentage_luminosite: null as number | null,
  valeur_eau: null as number | null,
  tension_sol: null as number | null,
  valeur_brute_sol: null as number | null,
};

// POST routes
router.post("/temperature", (req: Request, res: Response) => {
  sensorData.temperature = req.body.temperature;
  res.status(200).send("Données reçues avec succès");
});

router.post("/humidite", (req: Request, res: Response) => {
  sensorData.humidite = req.body.humidite;
  res.status(200).send("Données reçues avec succès");
});

router.post("/sol", (req: Request, res: Response) => {
  sensorData.tension_sol = req.body.humidite_sol;
  sensorData.valeur_brute_sol = req.body.valeur_brute_sol;
  res.status(200).send("Données reçues avec succès");
});

router.post("/luminosite", (req: Request, res: Response) => {
  sensorData.pourcentage_luminosite = req.body.luminosite;
  res.status(200).send("Données reçues avec succès");
});

router.post("/niveau_eau", (req: Request, res: Response) => {
  sensorData.valeur_eau = req.body.niveau_eau;
  res.status(200).send("Données reçues avec succès");
});

function createWriteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function publicApiBaseUrl(req: Request): string {
  return (
    process.env.API_BASE_URL ||
    process.env.PUBLIC_API_BASE_URL ||
    `${req.protocol}://${req.get("host")}`
  );
}

function sensorReadingPayload(reading: any) {
  return {
    id: reading.id.toString(),
    sensor_id: reading.sensor_id,
    sensor_name: reading.sensors.name,
    sensor_type: reading.sensors.type,
    unit: reading.sensors.unit,
    value_numeric: reading.value_numeric,
    raw_value: reading.raw_value,
    voltage: reading.voltage,
    created_at: reading.created_at,
    updated_at: reading.updated_at,
    recorded_at: reading.recorded_at,
  };
}

function sensorPayload(sensor: any) {
  return {
    id: sensor.id,
    hardware_id: sensor.hardware_id,
    name: sensor.name,
    type: sensor.type,
    unit: sensor.unit,
    is_active: sensor.is_active,
    data_collection_enabled: sensor.data_collection_enabled,
    created_at: sensor.created_at,
    updated_at: sensor.updated_at,
    latest_reading: sensor.sensor_readings
      ? {
          id: sensor.sensor_readings.id.toString(),
          sensor_id: sensor.sensor_readings.sensor_id,
          value_numeric: sensor.sensor_readings.value_numeric,
          raw_value: sensor.sensor_readings.raw_value,
          voltage: sensor.sensor_readings.voltage,
          created_at: sensor.sensor_readings.created_at,
          updated_at: sensor.sensor_readings.updated_at,
          recorded_at: sensor.sensor_readings.recorded_at,
        }
      : null,
  };
}

router.post(
  "/sensors/claim",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { hardware_id, name, type, unit } = req.body;
      const userId = req.user!.userId;

      if (
        typeof hardware_id !== "string" ||
        hardware_id.trim().length === 0
      ) {
        res.status(400).json({ error: "hardware_id est requis." });
        return;
      }

      const hardwareId = hardware_id.trim();
      const sensorName =
        typeof name === "string" && name.trim().length > 0
          ? name.trim()
          : "Capteur Smart Garden";
      const sensorType =
        typeof type === "string" && type.trim().length > 0
          ? type.trim()
          : "temperature";
      const sensorUnit =
        typeof unit === "string" && unit.trim().length > 0 ? unit.trim() : "C";

      const existingSensor = await prisma.sensors.findUnique({
        where: { hardware_id: hardwareId },
      });

      if (existingSensor?.userId && existingSensor.userId !== userId) {
        res
          .status(409)
          .json({ error: "Ce capteur est déjà associé à un autre compte." });
        return;
      }

      const writeToken = createWriteToken();
      const sensor = existingSensor
        ? await prisma.sensors.update({
            where: { id: existingSensor.id },
            data: {
              name: sensorName,
              type: sensorType,
              unit: sensorUnit,
              userId,
              write_token: writeToken,
              is_active: true,
              data_collection_enabled: false,
            },
          })
        : await prisma.sensors.create({
            data: {
              hardware_id: hardwareId,
              name: sensorName,
              type: sensorType,
              unit: sensorUnit,
              userId,
              write_token: writeToken,
              data_collection_enabled: false,
            },
          });

      res.status(200).json({
        sensor_id: sensor.id,
        hardware_id: sensor.hardware_id,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit,
        write_token: writeToken,
        api_base_url: publicApiBaseUrl(req),
        ingest_path: "/api/sensor-readings",
      });
    } catch (error) {
      console.error("Erreur association capteur:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.get(
  "/sensors",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sensors = await prisma.sensors.findMany({
        where: {
          userId: req.user!.userId,
          is_active: true,
        },
        include: { sensor_readings: true },
        orderBy: { created_at: "asc" },
      });

      res.json(sensors.map(sensorPayload));
    } catch (error) {
      console.error("Erreur liste capteurs:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.post(
  "/sensors/:id/start",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sensor = await prisma.sensors.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
          is_active: true,
        },
      });

      if (!sensor) {
        res.status(404).json({ error: "Capteur introuvable." });
        return;
      }

      const updatedSensor = await prisma.sensors.update({
        where: { id: sensor.id },
        data: { data_collection_enabled: true },
        include: { sensor_readings: true },
      });

      res.json(sensorPayload(updatedSensor));
    } catch (error) {
      console.error("Erreur démarrage collecte:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.post(
  "/sensors/:id/stop",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sensor = await prisma.sensors.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
          is_active: true,
        },
      });

      if (!sensor) {
        res.status(404).json({ error: "Capteur introuvable." });
        return;
      }

      const updatedSensor = await prisma.sensors.update({
        where: { id: sensor.id },
        data: { data_collection_enabled: false },
        include: { sensor_readings: true },
      });

      res.json(sensorPayload(updatedSensor));
    } catch (error) {
      console.error("Erreur arrêt collecte:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.delete(
  "/sensors/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sensor = await prisma.sensors.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
          is_active: true,
        },
      });

      if (!sensor) {
        res.status(404).json({ error: "Capteur introuvable." });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.sensor_readings.deleteMany({
          where: { sensor_id: sensor.id },
        });

        await tx.sensors.update({
          where: { id: sensor.id },
          data: {
            userId: null,
            write_token: null,
            data_collection_enabled: false,
          },
        });
      });

      res.json({ status: "unpaired", sensor_id: sensor.id });
    } catch (error) {
      console.error("Erreur désappairage capteur:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.get(
  "/sensors/:id/collection-status",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sensorId = req.params.id;
      const writeToken =
        typeof req.query.write_token === "string"
          ? req.query.write_token
          : req.headers["x-sensor-token"];

      if (typeof writeToken !== "string" || writeToken.trim().length === 0) {
        res.status(401).json({ error: "write_token est requis." });
        return;
      }

      const sensor = await prisma.sensors.findUnique({
        where: { id: sensorId },
      });

      if (!sensor) {
        res.status(404).json({ error: "Capteur introuvable." });
        return;
      }

      if (!sensor.write_token || sensor.write_token !== writeToken) {
        res.status(403).json({ error: "write_token invalide." });
        return;
      }

      res.json({
        sensor_id: sensor.id,
        data_collection_enabled: sensor.data_collection_enabled,
      });
    } catch (error) {
      console.error("Erreur statut collecte:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.get(
  "/sensor-readings/latest",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sensorId =
        typeof req.query.sensor_id === "string" ? req.query.sensor_id : undefined;
      const sensorName =
        typeof req.query.sensor_name === "string"
          ? req.query.sensor_name
          : undefined;
      const sensorType =
        typeof req.query.sensor_type === "string"
          ? req.query.sensor_type
          : undefined;

      const where: any = {
        sensors: {
          is: {
            userId: req.user!.userId,
            is_active: true,
          },
        },
      };

      if (sensorId) {
        where.sensor_id = sensorId;
      }

      if (sensorName) {
        where.sensors.is.name = sensorName;
      }
      if (sensorType) {
        where.sensors.is.type = sensorType;
      }

      const latestReading = await prisma.sensor_readings.findFirst({
        where,
        orderBy: { updated_at: "desc" },
        include: { sensors: true },
      });

      if (!latestReading) {
        res.status(404).json({ error: "No data" });
        return;
      }

      res.json(sensorReadingPayload(latestReading));
    } catch (error) {
      console.error("Erreur lecture capteur:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

router.post(
  "/sensor-readings",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        sensor_id,
        write_token,
        humidity,
        temperature,
        value_numeric,
        raw_value,
        voltage,
        recorded_at,
      } = req.body;

      const numericValue =
        typeof value_numeric === "number"
          ? value_numeric
          : typeof humidity === "number"
          ? humidity
          : typeof temperature === "number"
          ? temperature
          : null;

      if (numericValue === null) {
        res.status(400).json({
          error: "value_numeric (ou humidity ou temperature) est requis.",
        });
        return;
      }

      if (typeof sensor_id !== "string" || sensor_id.trim().length === 0) {
        res.status(400).json({ error: "sensor_id est requis." });
        return;
      }

      if (typeof write_token !== "string" || write_token.trim().length === 0) {
        res.status(401).json({ error: "write_token est requis." });
        return;
      }

      const sensorId = sensor_id.trim();
      const existingSensor = await prisma.sensors.findUnique({
        where: { id: sensorId },
      });

      if (!existingSensor) {
        res.status(404).json({ error: "Capteur introuvable." });
        return;
      }

      if (!existingSensor.is_active) {
        res.status(403).json({ error: "Capteur inactif." });
        return;
      }

      if (!existingSensor.userId) {
        res.status(403).json({ error: "Capteur non associé à un compte." });
        return;
      }

      if (!existingSensor.data_collection_enabled) {
        res.status(403).json({ error: "Collecte non activée pour ce capteur." });
        return;
      }

      if (
        !existingSensor.write_token ||
        existingSensor.write_token !== write_token
      ) {
        res.status(403).json({ error: "write_token invalide." });
        return;
      }

      let recordedAtDate: Date | undefined;
      if (recorded_at) {
        recordedAtDate = new Date(recorded_at);
        if (Number.isNaN(recordedAtDate.getTime())) {
          res.status(400).json({ error: "recorded_at invalide." });
          return;
        }
      }

      const readingData = {
        value_numeric: numericValue,
        raw_value: typeof raw_value === "number" ? raw_value : null,
        voltage: typeof voltage === "number" ? voltage : null,
        recorded_at: recordedAtDate ?? null,
      };

      const reading = await prisma.$transaction(async (tx) => {
        const existingReadings = await tx.sensor_readings.findMany({
          where: { sensor_id: sensorId },
          select: { id: true },
          orderBy: [
            { updated_at: "desc" },
            { created_at: "desc" },
            { id: "desc" },
          ],
        });

        if (existingReadings.length === 0) {
          return tx.sensor_readings.create({
            data: {
              sensor_id: existingSensor.id,
              ...readingData,
            },
          });
        }

        const [latestReading, ...staleReadings] = existingReadings;

        if (staleReadings.length > 0) {
          await tx.sensor_readings.deleteMany({
            where: {
              id: {
                in: staleReadings.map((staleReading) => staleReading.id),
              },
            },
          });
        }

        return tx.sensor_readings.update({
          where: { id: latestReading.id },
          data: readingData,
        });
      });

      res.status(200).json({
        id: reading.id.toString(),
        sensor_id: reading.sensor_id,
        value_numeric: reading.value_numeric,
        raw_value: reading.raw_value,
        voltage: reading.voltage,
        recorded_at: reading.recorded_at,
        created_at: reading.created_at,
        updated_at: reading.updated_at,
      });
      return;
    } catch (error: any) {
      console.error("Erreur ingestion capteur:", error);
      res.status(500).json({
        error: "Erreur serveur.",
        detail: process.env.NODE_ENV === "production" ? undefined : error.message,
      });
      return;
    }
  }
);

// GET routes
router.get("/temperature", (req: Request, res: Response) => {
  res.json({ temperature: sensorData.temperature });
});

router.get("/humidite", (req: Request, res: Response) => {
  res.json({ humidite: sensorData.humidite });
});

router.get("/sol", (req: Request, res: Response) => {
  res.json({
    tension_sol: sensorData.tension_sol,
    valeur_brute_sol: sensorData.valeur_brute_sol,
  });
});

router.get("/luminosite", (req: Request, res: Response) => {
  res.json({ pourcentage_luminosite: sensorData.pourcentage_luminosite });
});

router.get("/niveau_eau", (req: Request, res: Response) => {
  res.json({ valeur_eau: sensorData.valeur_eau });
});

router.get("/sensorData", (req: Request, res: Response) => {
  res.json(sensorData);
});

export default router;
