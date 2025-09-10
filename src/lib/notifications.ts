import { Resend } from "resend"
import { Queue } from "bullmq"
import IORedis from "ioredis"

const resend = new Resend(process.env.RESEND_API_KEY || "")

// Redis connection
const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

// Queue for notifications
export const notificationsQueue = new Queue("notifications", { connection })

// Email
export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set. Email not sent.")
    return
  }

  await resend.emails.send({
    from: "FastAgenda <fastagendanoreply@gmail.com>",
    to,
    subject,
    html,
  })
}

// WhatsApp (stub)
export async function sendWhatsApp(to: string, message: string) {
  console.log(`📱 [WhatsApp Stub] Para ${to} - Msg: ${message}`)
  // Integração futura com Twilio, Zenvia, etc
}

// SMS (stub)
export async function sendSMS(to: string, message: string) {
  console.log(`📩 [SMS Stub] Para: ${to} - Msg: ${message}`)
  // Integração futura com Twilio, Vonage, etc.
}

// Reminder Scheduling
export async function scheduleReminder(
  type: "email" | "whatsapp" | "sms",
  payload: { to: string; subject?: string; message: string; html?: string },
  scheduledAt: Date
) {
  await notificationsQueue.add(
    "reminder",
    { type, payload },
    { delay: scheduledAt.getTime() - Date.now() }
  )
}
