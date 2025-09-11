import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authMiddleware } from "@/middlewares/authMiddleware"
import { serviceSchema } from "@/lib/validators"

// GET /api/services
export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  // @ts-expect-error injetado no middleware
  const userId = req.userId as string

  const services = await prisma.service.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(services, { status: 200 })
}

// POST /api/services
export async function POST(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  // @ts-expect-error injetado no middleware
  const userId = req.userId as string

  try {
    const body = await req.json()
    const parsed = serviceSchema.parse(body)

    const newService = await prisma.service.create({
      data: { ...parsed, userId },
    })

    return NextResponse.json(newService, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

// PUT /api/services/:id
export async function PUT(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  // @ts-expect-error injetado no middleware
  const userId = req.userId as string
  const { pathname } = new URL(req.url)
  const id = pathname.split("/").pop()

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = serviceSchema.partial().parse(body)

    const updated = await prisma.service.update({
      where: { id, userId },
      data: parsed,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

// DELETE /api/services/:id
export async function DELETE(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  // @ts-expect-error injetado no middleware
  const userId = req.userId as string
  const { pathname } = new URL(req.url)
  const id = pathname.split("/").pop()

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
  }

  try {
    await prisma.service.delete({
      where: { id, userId },
    })
    return NextResponse.json({ message: "Serviço removido" }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}
