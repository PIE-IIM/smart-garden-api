"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
let sensorData = {
    temperature: null,
    humidite: null,
    pourcentage_luminosite: null,
    valeur_eau: null,
    tension_sol: null,
    valeur_brute_sol: null,
};
// POST routes
router.post("/temperature", (req, res) => {
    sensorData.temperature = req.body.temperature;
    res.status(200).send("Données reçues avec succès");
});
router.post("/humidite", (req, res) => {
    sensorData.humidite = req.body.humidite;
    res.status(200).send("Données reçues avec succès");
});
router.post("/sol", (req, res) => {
    sensorData.tension_sol = req.body.humidite_sol;
    sensorData.valeur_brute_sol = req.body.valeur_brute_sol;
    res.status(200).send("Données reçues avec succès");
});
router.post("/luminosite", (req, res) => {
    sensorData.pourcentage_luminosite = req.body.luminosite;
    res.status(200).send("Données reçues avec succès");
});
router.post("/niveau_eau", (req, res) => {
    sensorData.valeur_eau = req.body.niveau_eau;
    res.status(200).send("Données reçues avec succès");
});
// GET routes
router.get("/temperature", (req, res) => {
    res.json({ temperature: sensorData.temperature });
});
router.get("/humidite", (req, res) => {
    res.json({ humidite: sensorData.humidite });
});
router.get("/sol", (req, res) => {
    res.json({
        tension_sol: sensorData.tension_sol,
        valeur_brute_sol: sensorData.valeur_brute_sol,
    });
});
router.get("/luminosite", (req, res) => {
    res.json({ pourcentage_luminosite: sensorData.pourcentage_luminosite });
});
router.get("/niveau_eau", (req, res) => {
    res.json({ valeur_eau: sensorData.valeur_eau });
});
router.get("/sensorData", (req, res) => {
    res.json(sensorData);
});
exports.default = router;
//# sourceMappingURL=sensor.controller.js.map