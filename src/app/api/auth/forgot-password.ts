import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function forgotPasswordHandler(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Futuramente: gerar token temporário e enviar por email (Resend)
    // Por agora só simula
    return NextResponse.json({ message: "Instruções enviadas para o email" })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    } else {
      console.error("Erro desconhecido:", err)
      return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 })
    }
  }
}
