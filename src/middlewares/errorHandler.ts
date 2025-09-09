import { NextRequest, NextResponse } from "next/server"

type HandlerFn = (req: NextRequest) => Promise<NextResponse>

export function withErrorHandler(handler: HandlerFn) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (err: unknown) {
      console.error("API Error:", err)

      const error = err as { message?: string; status?: number }

      return NextResponse.json(
        {
          error: true,
          message:
            error.message || "Internal server error. Please try again later.",
        },
        { status: error.status || 500 }
      )
    }
  }
}
