import { createContext, ReactNode, useEffect, useState } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

interface User {
  id: string
  name: string
  email: string
  profile_photo_url?: string
}

interface DecodedToken {
  userId: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carrega token do localStorage se existir
    const savedToken = localStorage.getItem("fastagenda_token")
    if (savedToken) {
      setToken(savedToken)
      const decoded = jwtDecode<DecodedToken>(savedToken)
      setUser({ id: decoded.userId, name: decoded.name, email: decoded.email })
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await axios.post("/api/auth/login", { email, password })
      const { token } = res.data
      localStorage.setItem("fastagenda_token", token)
      setToken(token)
      const decoded = jwtDecode<DecodedToken>(token)
      setUser({ id: decoded.userId, name: decoded.name, email: decoded.email })
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("fastagenda_token")
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
