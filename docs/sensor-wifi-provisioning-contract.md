# Contrat provisioning Wi-Fi Smart Garden

Ce contrat décrit le mode d'appairage sans Bluetooth. La Raspberry démarre en point d'accès Wi-Fi, expose une petite API HTTP locale, puis l'app mobile lui envoie le Wi-Fi du jardin et les credentials API.

## Mode point d'accès

- SSID recommandé: `SmartGarden-XXXX`, où `XXXX` identifie le capteur.
- Adresse locale recommandée: `http://192.168.4.1`.
- L'utilisateur se connecte manuellement à ce Wi-Fi depuis les réglages du téléphone.
- L'app appelle ensuite l'API locale de la Raspberry.

## API locale Raspberry

### `GET /device-info`

Retourne les informations utilisées par l'app pour associer le capteur au compte connecté.

```json
{
  "hardware_id": "smart-garden-temp-001",
  "name": "Capteur temperature sol",
  "type": "temperature",
  "unit": "C",
  "fw_version": "1.0.0"
}
```

### `POST /provision`

Reçoit le Wi-Fi du jardin et les credentials retournés par l'API centrale après `POST /api/sensors/claim`.

```json
{
  "wifi_ssid": "Nom du Wi-Fi",
  "wifi_password": "mot-de-passe",
  "sensor_id": "uuid-retourne-par-api",
  "write_token": "token-retourne-par-api",
  "api_base_url": "https://smart-garden-api-production.up.railway.app",
  "ingest_path": "/api/sensor-readings"
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

Le firmware poll ensuite le statut avec son token:

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

Le firmware doit poster les mesures sur `api_base_url + ingest_path` uniquement quand `data_collection_enabled` vaut `true`.

```json
{
  "sensor_id": "uuid-retourne-par-api",
  "write_token": "token-retourne-par-api",
  "value_numeric": 22.4,
  "raw_value": 12345,
  "voltage": 2.91,
  "recorded_at": "2026-05-22T12:00:00.000Z"
}
```

`value_numeric` peut être remplacé par `humidity` ou `temperature` pour compatibilité de payload, mais `sensor_id` et `write_token` sont obligatoires.

L'API centrale refuse l'ingestion si la collecte n'est pas activée pour ce capteur. Les mesures sont stockées avec la logique d'écrasement: une seule ligne `sensor_readings` par capteur.
