import { useCallback, useEffect, useState } from "react"
import { createApiClient } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

export interface Appointment {
  id: string
  clientId: string
  serviceId: string
  startDatetime: string
  endDatetime: string
  status: string
  notes?: string
  paymentStatus: string
}

export function useAppointments() {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = createApiClient(token || undefined)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Appointment[]>("/appointments")
      setAppointments(res.data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Erro desconhecido")
      }
    } finally {
      setLoading(false)
    }
  }, [api])

  const createAppointment = async (data: Partial<Appointment>) => {
    const res = await api.post<Appointment>("/appointments", data)
    setAppointments((prev) => [...prev, res.data])
  }

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const res = await api.put<Appointment>(`/appointments/${id}`, data)
    setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)))
  }

  const deleteAppointment = async (id: string) => {
    await api.delete(`/appointments/${id}`)
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  useEffect(() => {
    if (token) fetchAppointments()
  }, [token, fetchAppointments])

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  }
}
