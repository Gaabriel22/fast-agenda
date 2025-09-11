import { NextRequest, NextResponse } from "next/server"
import { loginHandler } from "./login"
import { registerHandler } from "./register"
import { forgotPasswordHandler } from "./forgot-password"

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)

  if (pathname.endsWith("/login")) return loginHandler(req)
  if (pathname.endsWith("/register")) return registerHandler(req)
  if (pathname.endsWith("/forgot-password")) return forgotPasswordHandler(req)

  return NextResponse.json({ error: "Not Found" }, { status: 404 })
}
