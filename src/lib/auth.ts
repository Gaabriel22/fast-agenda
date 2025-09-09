import axios from "axios"
import { jwtDecode } from "jwt-decode"

export interface DecodedToken {
  userId: string
  name: string
  email: string
}

export const login = async (
  email: string,
  password: string
): Promise<string> => {
  const res = await axios.post("/api/auth/login", { email, password })
  return res.data.token
}

export const logout = () => {
  localStorage.removeItem("fastagenda_token")
}

export const decodeToken = (token: string): DecodedToken => {
  return jwtDecode<DecodedToken>(token)
}

export const getUserFromStorage = (): DecodedToken | null => {
  const token = localStorage.getItem("fastagenda_token")
  if (!token) return null
  return decodeToken(token)
}
