import jwt, { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.")
  }
  return secret
})()

export interface AuthRequest extends NextRequest {
  userId?: string
}

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: missing or invalid token" },
      { status: 401 }
    )
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (typeof decoded === "object" && "userId" in decoded) {
      // @ts-expect-error - userId injetado manualmente
      req.userId = (decoded as JwtPayload).userId as string
      return null // autorizado
    }

    return NextResponse.json(
      { error: "Unauthorized: token payload is invalid" },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: invalid token" },
      { status: 401 }
    )
  }
}
