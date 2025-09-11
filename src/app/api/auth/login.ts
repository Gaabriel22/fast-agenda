import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validators"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined")

export async function loginHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const validPassword = await bcrypt.compare(
      parsed.password,
      user.passwordHash
    )

    if (!validPassword) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    return NextResponse.json({ token }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    } else {
      console.error("Erro desconhecido:", err)
      return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
    }
  }
}
