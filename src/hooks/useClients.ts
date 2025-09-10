import { useCallback, useEffect, useState } from "react"
import { useAuth } from "./useAuth"
import { createApiClient } from "@/lib/api"

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
}

export function useClients() {
  const { token } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = createApiClient(token || undefined)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Client[]>("/clients")
      setClients(res.data)
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

  const createClient = async (data: Partial<Client>) => {
    const res = await api.post<Client>("/clients", data)
    setClients((prev) => [...prev, res.data])
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    const res = await api.put<Client>(`/clients/${id}`, data)
    setClients((prev) => prev.map((c) => (c.id === id ? res.data : c)))
  }

  const deleteClient = async (id: string) => {
    await api.delete(`/clients/${id}`)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  useEffect(() => {
    if (token) fetchClients()
  }, [token, fetchClients])

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  }
}
