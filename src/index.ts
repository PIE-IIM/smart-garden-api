import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserController } from './controllers/user.controller';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const userController = new UserController(prisma)

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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);