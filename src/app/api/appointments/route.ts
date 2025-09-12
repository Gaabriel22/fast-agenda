import { scheduleReminder } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { appointmentSchema } from "@/lib/validators"
import { authMiddleware, AuthRequest } from "@/middlewares/authMiddleware"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const { userId } = req as AuthRequest
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: { client: true, service: true },
    orderBy: { startDatetime: "asc" },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const { userId } = req as AuthRequest
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = appointmentSchema.parse(body)

    // Checa conflitos de horário
    const conflict = await prisma.appointment.findFirst({
      where: {
        userId,
        startDatetime: { lte: new Date(parsed.endTimeDate) },
        endDatetime: { gte: new Date(parsed.startDateTime) },
        status: { not: "cancelled" },
      },
    })

    if (conflict) {
      return NextResponse.json({ error: "Horário já ocupado" }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        clientId: parsed.clientId,
        serviceId: parsed.serviceId,
        startDatetime: new Date(parsed.startDateTime),
        endDatetime: new Date(parsed.endTimeDate),
        status: parsed.status,
        notes: parsed.notes,
        paymentStatus: parsed.paymentStatus,
      },
    })

    // Agendar lembrete por email (opcional)
    const client = await prisma.client.findUnique({
      where: { id: parsed.clientId },
    })
    if (client?.email) {
      await scheduleReminder(
        "email",
        {
          to: client.email,
          subject: "Novo agendamento",
          message: `Seu agendamento está marcado para ${parsed.startDateTime}`,
        },
        new Date(parsed.startDateTime)
      )
    }

    return NextResponse.json(appointment)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const { userId } = req as AuthRequest
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { id, ...data } = appointmentSchema.parse(body)

    // Checa conflito de horário para o update
    const conflict = await prisma.appointment.findFirst({
      where: {
        userId,
        id: { not: id },
        startDatetime: { lte: new Date(data.endTimeDate) },
        endDatetime: { gte: new Date(data.startDateTime) },
        status: { not: "cancelled" },
      },
    })
    if (conflict) {
      return NextResponse.json({ error: "Horário já ocupado" }, { status: 400 })
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        startDatetime: new Date(data.startDateTime),
        endDatetime: new Date(data.endTimeDate),
        status: data.status,
        notes: data.notes,
        paymentStatus: data.paymentStatus,
      },
    })

    return NextResponse.json(updated)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const { userId } = req as AuthRequest
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await req.json()
    await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ message: "Agendamento deletado" })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}
