import { prisma } from "@/lib/prisma"
import { notificationSchema } from "@/lib/validators"
import { authMiddleware, AuthRequest } from "@/middlewares/authMiddleware"
import { NextResponse } from "next/server"

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const notifications = await prisma.notification.findMany({
      where: { appointment: { userId: req.userId } },
      orderBy: { scheduledAt: "asc" },
    })
    return NextResponse.json(notifications)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const parsed = notificationSchema.parse(body)

    const newNotification = await prisma.notification.create({
      data: {
        appointmentId: parsed.appointmentId,
        type: parsed.type,
        status: parsed.status,
        scheduledAt: parsed.scheduledAt
          ? new Date(parsed.scheduledAt)
          : new Date(),
        message: parsed.message,
      },
    })

    return NextResponse.json(newNotification, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

export async function DELETE(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const url = new URL(req.url)
  const id = url.pathname.split("/").pop()
  if (!id)
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })

  try {
    await prisma.notification.deleteMany({
      where: { id, appointment: { userId: req.userId } },
    })
    return NextResponse.json({ message: "Notificação deletada" })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}
