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

// Exemple de route protégée
import { authenticateToken, AuthRequest } from './middleware/auth.middleware';
app.get('/api/me', authenticateToken, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json({ user });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);



// app.use(cors({
//   origin: 'http://localhost:8081',
//   credentials: true
// }))

// app.use(express.json())

// app.listen(3000, () =>
//   console.log('REST API server ready at: http://localhost:3000'),
// )

// app.get('/users', async (req, res) => {
//   const users = await prisma.user.findMany()
//   res.json(users)
// })

// app.post('/createUser', async (req, res) => {
//   const { name, email, password } = req.body
//   const user = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password
//     },
//   })
//   res.json(user)
// })

// async function main() {
//   // ... your Prisma Client queries will go here
//   const newUser = await prisma.user.create({
//     data: {
//       name: 'Alice',
//       email: 'alice@prisma.io',
//       hasGarden: true,
//     },
//   })
//   console.log('Created new user: ', newUser)

//   const allUsers = await prisma.user.findMany({
//     select: { hasGarden: true },
//   })
//   console.log('All users: ')
//   console.dir(allUsers, { depth: null })
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(async () => await prisma.$disconnect())