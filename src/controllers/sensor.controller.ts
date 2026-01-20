import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";

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

router.get(
  "/sensor-readings/latest",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sensorId =
        typeof req.query.sensor_id === "string" ? req.query.sensor_id : undefined;
      const sensorName =
        typeof req.query.sensor_name === "string"
          ? req.query.sensor_name
          : undefined;

      const where: {
        sensor_id?: string;
        sensors?: { is: { name: string } };
      } = {};

      if (sensorId) {
        where.sensor_id = sensorId;
      }

      if (sensorName) {
        where.sensors = { is: { name: sensorName } };
      }

      const latestReading = await prisma.sensor_readings.findFirst({
        where,
        orderBy: { created_at: "desc" },
        include: { sensors: true },
      });

      if (!latestReading) {
        res.status(404).json({ error: "No data" });
        return;
      }

      res.json({
        id: latestReading.id.toString(),
        sensor_id: latestReading.sensor_id,
        sensor_name: latestReading.sensors.name,
        value_numeric: latestReading.value_numeric,
        raw_value: latestReading.raw_value,
        created_at: latestReading.created_at,
        recorded_at: latestReading.recorded_at,
      });
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
      sensor_name,
      humidity,
      value_numeric,
      raw_value,
      voltage,
      recorded_at,
      type,
      unit,
    } = req.body;

    const numericValue =
      typeof value_numeric === "number"
        ? value_numeric
        : typeof humidity === "number"
        ? humidity
        : null;

    if (numericValue === null) {
      res
        .status(400)
        .json({ error: "value_numeric (ou humidity) est requis." });
      return;
    }

    let sensorId = sensor_id as string | undefined;

    if (!sensorId) {
      if (!sensor_name || typeof sensor_name !== "string") {
        res
          .status(400)
          .json({ error: "sensor_id ou sensor_name est requis." });
        return;
      }

      const existingSensor = await prisma.sensors.findFirst({
        where: { name: sensor_name },
      });

      if (existingSensor) {
        sensorId = existingSensor.id;
      } else {
        const createdSensor = await prisma.sensors.create({
          data: {
            name: sensor_name,
            type: typeof type === "string" ? type : "humidity",
            unit: typeof unit === "string" ? unit : "%",
          },
        });
        sensorId = createdSensor.id;
      }
    } else {
      const existingSensor = await prisma.sensors.findUnique({
        where: { id: sensorId },
      });

      if (!existingSensor) {
        res.status(404).json({ error: "Capteur introuvable." });
        return;
      }
    }

    let recordedAtDate: Date | undefined;
    if (recorded_at) {
      recordedAtDate = new Date(recorded_at);
      if (Number.isNaN(recordedAtDate.getTime())) {
        res.status(400).json({ error: "recorded_at invalide." });
        return;
      }
    }

    const createdReading = await prisma.sensor_readings.create({
      data: {
        sensor_id: sensorId,
        value_numeric: numericValue,
        raw_value: typeof raw_value === "number" ? raw_value : null,
        voltage: typeof voltage === "number" ? voltage : null,
        recorded_at: recordedAtDate,
      },
    });

    res.status(201).json({
      ...createdReading,
      id: createdReading.id.toString(),
    });
    return;
  } catch (error) {
    console.error("Erreur ingestion capteur:", error);
    res.status(500).json({ error: "Erreur serveur." });
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
