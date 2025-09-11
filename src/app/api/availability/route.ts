import { prisma } from "@/lib/prisma"
import { AvailabilitySlotSchema } from "@/lib/validators"
import { authMiddleware, AuthRequest } from "@/middlewares/authMiddleware"
import { NextResponse } from "next/server"

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  const slots = await prisma.availabilitySlot.findMany({
    where: { userId: req.userId },
    orderBy: { dayOfWeek: "asc" },
  })
  return NextResponse.json(slots)
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const parsed = AvailabilitySlotSchema.parse(body)

    const slot = await prisma.availabilitySlot.create({
      data: {
        userId: req.userId!,
        dayOfWeek: parsed.dayOfWeek,
        startTime: new Date(parsed.startTime),
        endTime: new Date(parsed.endTime),
        isHoliday: parsed.isHoliday ?? false,
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

export async function PUT(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })

    const body = await req.json()
    const parsed = AvailabilitySlotSchema.parse(body)

    const updated = await prisma.availabilitySlot.update({
      where: { id },
      data: {
        dayOfWeek: parsed.dayOfWeek,
        startTime: new Date(parsed.startTime),
        endTime: new Date(parsed.endTime),
        isHoliday: parsed.isHoliday ?? false,
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

export async function DELETE(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })

    await prisma.availabilitySlot.delete({ where: { id } })
    return NextResponse.json({ message: "Dispobilidade removida" })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}
