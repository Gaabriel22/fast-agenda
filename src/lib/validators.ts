import { z } from "zod"

// -----------------------------
// Auth
// -----------------------------
export const loginSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
})

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Nome muito curto" }),
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  phone: z.string().optional(),
  profilePhotoUrl: z.url().optional(),
  address: z.string().optional(),
  timezone: z.string().default("UTC"),
  plan: z.enum(["free", "pro", "premium"]).default("free"),
})

// -----------------------------
// Services
// -----------------------------
export const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  price: z.number().positive(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Cor deve ser HEX" })
    .optional(),
})

// -----------------------------
// Appointments
// -----------------------------
export const appointmentSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  clientId: z.uuid(),
  serviceId: z.uuid(),
  startDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data/hora inválida",
  }),
  endTimeDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data/hora inválida",
  }),
  status: z
    .enum(["pending", "confirmed", "cancelled", "completed"])
    .default("pending"),
  notes: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded"]).default("pending"),
})

// -----------------------------
// Clients
// -----------------------------
export const clientSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(2),
  email: z.email().optional(),
  phone: z.string().optional(),
})

// -----------------------------
// AvailabilitySlot
// -----------------------------
export const AvailabilitySlotSchema = z.object({
  dayOfWeek: z
    .number()
    .int()
    .min(0, { message: "Dia da semana inválido" })
    .max(6, { message: "Dia da semana inválido" }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Hora de início inválida",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Hora de término inválida",
  }),
  isHoliday: z.boolean().optional(),
})
