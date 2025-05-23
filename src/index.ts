import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { signup, login } from './controllers/auth.controller';

dotenv.config();
const app = express();
const prisma = new PrismaClient();


app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());

// Routes d'authentification
app.post('/api/signup', signup);
app.post('/api/login', login);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);