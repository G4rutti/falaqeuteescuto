import type { SignupData, LoginData, AuthResponse } from "../types/auth"
import { config } from "../lib/config"

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      console.log("[v0] 📝 Iniciando cadastro para:", data.email)
      console.log("[v0] 🌐 URL da API:", `${config.api.baseUrl}${config.api.endpoints.auth.register}`)

      const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.register}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          slug: data.slug,
          password: data.password,
        }),
      })

      console.log("[v0] 📡 Status da resposta:", response.status)
      console.log("[v0] 📡 Headers da resposta:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        if (response.status === 0 || !response.status) {
          throw new Error("Erro de conexão: Verifique se o backend está rodando em localhost:8080")
        }

        let errorMessage = "Erro no cadastro"
        try {
          const result = await response.json()
          errorMessage = result.message || errorMessage
          console.log("[v0] 📄 Erro da API:", result)
        } catch {
          console.log("[v0] ❌ Não foi possível parsear resposta de erro")
          if (response.status === 404) {
            errorMessage = "Endpoint não encontrado. Verifique se a API está configurada corretamente."
          } else if (response.status >= 500) {
            errorMessage = "Erro interno do servidor. Tente novamente mais tarde."
          }
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("[v0] 📄 Corpo da resposta:", result)
      console.log("[v0] ✅ Cadastro realizado com sucesso!")

      return result
    } catch (error) {
      console.error("[v0] 💥 Erro durante cadastro:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
      }

      throw error
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log("[v0] 🔐 Iniciando login para:", data.email)
      console.log("[v0] 🌐 URL da API:", `${config.api.baseUrl}${config.api.endpoints.auth.login}`)

      const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("[v0] 📡 Status da resposta:", response.status)
      console.log("[v0] 📡 Headers da resposta:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        if (response.status === 0 || !response.status) {
          throw new Error("Erro de conexão: Verifique se o backend está rodando em localhost:8080")
        }

        let errorMessage = "Erro no login"
        try {
          const result = await response.json()
          errorMessage = result.message || errorMessage
          console.log("[v0] 📄 Erro da API:", result)
        } catch {
          console.log("[v0] ❌ Não foi possível parsear resposta de erro")
          if (response.status === 404) {
            errorMessage = "Endpoint não encontrado. Verifique se a API está configurada corretamente."
          } else if (response.status >= 500) {
            errorMessage = "Erro interno do servidor. Tente novamente mais tarde."
          } else if (response.status === 401) {
            errorMessage = "Email ou senha incorretos."
          }
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("[v0] 📄 Corpo da resposta:", result)
      console.log("[v0] ✅ Login realizado com sucesso!")
      console.log("[v0] 🔑 Token presente:", !!result.token)
      console.log("[v0] 👤 Dados do usuário:", !!result.user)

      return result
    } catch (error) {
      console.error("[v0] 💥 Erro durante login:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
      }

      throw error
    }
  },
}
