import { useCallback, useEffect, useState } from "react"
import { createApiClient } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

export interface Service {
  id: string
  name: string
  description?: string
  durationMinutes: number
  price: number
  color?: string
}

export function useServices() {
  const { token } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = createApiClient(token || undefined)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Service[]>("/services")
      setServices(res.data)
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

  const createService = async (data: Partial<Service>) => {
    const res = await api.post<Service>("/services", data)
    setServices((prev) => [...prev, res.data])
  }

  const updateService = async (id: string, data: Partial<Service>) => {
    const res = await api.put<Service>(`/services/${id}`, data)
    setServices((prev) => prev.map((s) => (s.id === id ? res.data : s)))
  }

  const deleteService = async (id: string) => {
    await api.delete(`/services/${id}`)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  useEffect(() => {
    if (token) fetchServices()
  }, [token, fetchServices])

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  }
}
