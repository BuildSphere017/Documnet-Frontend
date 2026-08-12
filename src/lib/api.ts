import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
export const TOKEN_KEY = "dms.accessToken"

export const api = axios.create({ baseURL: API_URL, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
