import bcrypt from 'bcryptjs'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(cors({
  origin: ['http://localhost:8081', 'exp://10.2.164.186:8081'],
  credentials: true
}))

app.use(express.json())

app.listen(3000, () =>
  console.log('REST API server ready at: http://localhost:3000'),
)

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

app.post('/createUser', async (req, res) => {
  const { name, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    },
  })
  res.json(user)
})
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