/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Criar plano free
  const freePlan = await prisma.saasPlan.upsert({
    where: { name: "Free" },
    update: {},
    create: {
      name: "Free",
      price: 0,
      maxServices: 3,
      maxAppointments: 30,
    },
  })

  const proPlan = await prisma.saasPlan.upsert({
    where: { name: "Pro" },
    update: {},
    create: {
      name: "Pro",
      price: 49.9,
      maxServices: 20,
      maxAppointments: 300,
    },
  })

  // Criar usuário teste
  const passwordHash = await bcrypt.hash("123456", 10)

  const user = await prisma.user.upsert({
    where: { email: "test@fastagenda.io" },
    update: {},
    create: {
      name: "Test User",
      email: "test@fastagenda.io",
      passwordHash,
      phone: "+55119987654321",
      timezone: "America/Sao_Paulo",
      plan: "Free",
    },
  })

  // Criar serviço teste
  await prisma.service.createMany({
    data: [
      {
        userId: user.id,
        name: "Corte de cabelo",
        description: "Corte moderno e estiloso.",
        durationMinutes: 45,
        price: 60,
        color: "#FF3B30",
      },
      {
        userId: user.id,
        name: "Manicure",
        description: "Cuidado completo para suas unhas.",
        durationMinutes: 30,
        price: 40,
        color: "#4ECDC4",
      },
    ],
    skipDuplicates: true,
  })

  console.log("✅ Seed concluído!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
