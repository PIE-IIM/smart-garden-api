# Contrat provisioning Wi-Fi Smart Garden

Ce contrat décrit le mode d'appairage sans Bluetooth. La Raspberry démarre en point d'accès Wi-Fi, expose une petite API HTTP locale, puis l'app mobile lui envoie le Wi-Fi du jardin et les credentials API.

## Mode point d'accès

- SSID recommandé: `SmartGarden-XXXX`, où `XXXX` identifie le capteur.
- Adresse locale recommandée: `http://192.168.4.1`.
- L'utilisateur se connecte manuellement à ce Wi-Fi depuis les réglages du téléphone.
- L'app appelle ensuite l'API locale de la Raspberry.

## API locale Raspberry

### `GET /device-info`

Retourne les informations utilisées par l'app pour associer les capteurs au compte connecté. Le champ racine `hardware_id` reste présent pour compatibilité, mais l'app doit utiliser `sensors[]` quand il est disponible.

```json
{
  "device_hardware_id": "smart-garden-pico-001",
  "hardware_id": "smart-garden-temp-001",
  "name": "Capteur temperature sol",
  "type": "temperature",
  "unit": "C",
  "fw_version": "1.0.0",
  "sensors": [
    {
      "id": "tmp117",
      "local_id": "tmp117",
      "hardware_id": "smart-garden-tmp117-001",
      "name": "TMP117 temperature sol",
      "type": "temperature",
      "unit": "C",
      "bus": "i2c",
      "address": "0x48",
      "connected": true
    },
    {
      "id": "soil-adc-gp26",
      "local_id": "soil-adc-gp26",
      "hardware_id": "smart-garden-soil-adc-gp26-001",
      "name": "Capteur humidite sol",
      "type": "humidity",
      "unit": "%",
      "bus": "adc",
      "pin": 26,
      "connected": true
    }
  ]
}
```

### `POST /provision`

Reçoit le Wi-Fi du jardin et les credentials retournés par l'API centrale après un `POST /api/sensors/claim` par capteur détecté. Les champs racine `sensor_id` et `write_token` restent présents pour compatibilité, mais le firmware doit utiliser `sensors[]` quand il est disponible.

```json
{
  "wifi_ssid": "Nom du Wi-Fi",
  "wifi_password": "mot-de-passe",
  "sensor_id": "uuid-temp-retourne-par-api",
  "write_token": "token-temp-retourne-par-api",
  "api_base_url": "https://smart-garden-api-production.up.railway.app",
  "ingest_path": "/api/sensor-readings",
  "sensors": [
    {
      "local_id": "tmp117",
      "hardware_id": "smart-garden-tmp117-001",
      "name": "TMP117 temperature sol",
      "type": "temperature",
      "unit": "C",
      "sensor_id": "uuid-temp-retourne-par-api",
      "write_token": "token-temp-retourne-par-api"
    },
    {
      "local_id": "soil-adc-gp26",
      "hardware_id": "smart-garden-soil-adc-gp26-001",
      "name": "Capteur humidite sol",
      "type": "humidity",
      "unit": "%",
      "sensor_id": "uuid-humidity-retourne-par-api",
      "write_token": "token-humidity-retourne-par-api"
    }
  ]
}
```

Réponse attendue:

```json
{
  "status": "ok"
}
```

Après réception, la Raspberry sauvegarde la configuration et rejoint le Wi-Fi du jardin. Elle ne poste aucune mesure tant que l'utilisateur n'a pas lancé la collecte depuis l'app.

## Contrôle de collecte

L'app démarre ou arrête la collecte côté API centrale:

```text
POST /api/sensors/:id/start
POST /api/sensors/:id/stop
```

Le firmware poll ensuite le statut avec le token de chaque capteur:

```text
GET /api/sensors/:id/collection-status?write_token=...
```

Réponse:

```json
{
  "sensor_id": "uuid-retourne-par-api",
  "data_collection_enabled": true
}
```

## Ingestion API après provisioning

Le firmware doit poster les mesures sur `api_base_url + ingest_path` uniquement quand `data_collection_enabled` vaut `true` pour le capteur correspondant.

```json
{
  "sensor_id": "uuid-temp-retourne-par-api",
  "write_token": "token-temp-retourne-par-api",
  "value_numeric": 22.4,
  "raw_value": 12345,
  "voltage": 2.91,
  "recorded_at": "2026-05-22T12:00:00.000Z"
}
```

`value_numeric` peut être remplacé par `humidity` ou `temperature` pour compatibilité de payload, mais `sensor_id` et `write_token` sont obligatoires. Pour un boitier avec plusieurs mesures, chaque lecture doit utiliser le couple `sensor_id` / `write_token` du capteur local correspondant.

L'API centrale refuse l'ingestion si la collecte n'est pas activée pour ce capteur. Les mesures sont stockées avec la logique d'écrasement: une seule ligne `sensor_readings` par capteur.
