import axios from "axios"

export const createApiClient = (token?: string) => {
  const api = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error)
      return Promise.reject(error)
    }
  )

  return api
}
