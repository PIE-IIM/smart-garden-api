import { Request, Response, Router } from "express";

const router = Router();

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
