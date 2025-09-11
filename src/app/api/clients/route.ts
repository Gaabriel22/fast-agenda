import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validators"
import { authMiddleware } from "@/middlewares/authMiddleware"
import { NextRequest, NextResponse } from "next/server"

// GET /api/clients
export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  // @ts-expect-error injetado no middleware
  const userId = req.userId as string

  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients, { status: 200 })
}

// POST /api/clients
export async function POST(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  // @ts-expect-error injetado no middleware
  const userId = req.userId as string

  try {
    const body = await req.json()
    const parsed = clientSchema.parse({ ...body, userId })

    const newClient = await prisma.client.create({
      data: parsed,
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}

// PUT /api/clients/:id
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
    const parsed = clientSchema.partial().parse({ ...body, userId })

    const updated = await prisma.client.update({
      where: { id },
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

// DELETE /api/clients/:id
export async function DELETE(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (auth) return auth

  const { pathname } = new URL(req.url)
  const id = pathname.split("/").pop()

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
  }

  try {
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ message: "Cliente Removido" }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
  }
}
