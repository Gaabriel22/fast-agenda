import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validators"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined")

export async function registerHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10)

    const newUser = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: hashedPassword,
        phone: parsed.phone,
        profilePhotoUrl: parsed.profilePhotoUrl,
        address: parsed.address,
        timezone: parsed.timezone,
        plan: parsed.plan,
      },
    })

    const token = jwt.sign(
      {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
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
