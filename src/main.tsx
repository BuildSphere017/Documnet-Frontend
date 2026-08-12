import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/lib/queryClient"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)
