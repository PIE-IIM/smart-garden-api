import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { UserController } from './controllers/user.controller';
import { PotagerController } from './controllers/potager.controller';
import { Utils } from './utils';
import { GardenController } from './controllers/garden.controller';
import { authenticateToken } from './middleware/auth.middleware'; 

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);
const gardenController = new GardenController(prisma, utils);
const potagerController = new PotagerController(prisma, utils);


app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  await userController.createUser(req, res);
})

app.post('/api/login', async (req, res) => {
  await userController.login(req, res);
})

app.post('/api/genvegetables', async (req, res) => {
  await gardenController.putVegetables(req, res);
})

app.get('/api/vegetables', (req, res) =>
  gardenController.getAll(req, res)
);

app.get('/api/user/vegetables', authenticateToken, (req, res) =>
  potagerController.list(req, res)
);

app.post('/api/user/vegetable', authenticateToken, (req, res) =>
  potagerController.add(req, res)
);

app.delete('/api/user/vegetable/:id', authenticateToken, (req, res) =>
  potagerController.remove(req, res)
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);