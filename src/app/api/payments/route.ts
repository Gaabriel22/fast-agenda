import { prisma } from "@/lib/prisma"
import { paymentSchema } from "@/lib/validators"
import { authMiddleware, AuthRequest } from "@/middlewares/authMiddleware"
import { NextResponse } from "next/server"

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const payments = await prisma.payment.findMany({
      where: { appointment: { userId: req.userId } },
    })
    return NextResponse.json(payments)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos" },
      { status: 500 }
    )
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const parsed = paymentSchema.parse(body)

    const appointment = await prisma.appointment.findUnique({
      where: { id: parsed.appointmentId },
    })

    if (!appointment || appointment.userId !== req.userId) {
      return NextResponse.json(
        { error: "Agendamento inválido" },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: parsed,
    })

    return NextResponse.json(payment)
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
    const parsed = paymentSchema.partial().parse(body)

    const existing = await prisma.payment.findUnique({
      where: { id },
      include: { appointment: true },
    })
    if (!existing || existing.appointment.userId !== req.userId) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      )
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: parsed,
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

    const existing = await prisma.payment.findUnique({
      where: { id },
      include: { appointment: true },
    })
    if (!existing || existing.appointment.userId !== req.userId) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      )
    }

    await prisma.payment.delete({ where: { id } })
    return NextResponse.json({ message: "Pagamento removido com sucesso" })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}
