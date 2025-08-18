import axios from "axios"
import type { MessageResponseDTO } from "@/types/message"
import { config } from "@/lib/config"

const API_URL = "https://falaqeuteescuto-backend.onrender.com" // Ou use uma variável de ambiente

interface SendMessagePayload {
  text: string
  slug: string
  // amount: number; // Futuramente, quando o pagamento for real
}

// Função auxiliar para obter token de forma segura
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null

  // Tentar localStorage primeiro
  const localToken = localStorage.getItem(config.storage.authToken)
  if (localToken) return localToken

  // Tentar cookies
  const nameEQ = config.storage.authToken + "="
  const ca = document.cookie.split(";")

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
    }
  }

  return null
}

export const messageService = {
  sendMessage: async (payload: SendMessagePayload) => {
    const response = await axios.post(`${API_URL}/message/send-message`, payload)
    return response.data
  },

  getMyMessages: async (): Promise<MessageResponseDTO[]> => {
    const token = getAuthToken()
    if (!token) {
      console.log("Token de autenticação não encontrado")
      throw new Error("Token de autenticação não encontrado")
    }

    try {
      const response = await axios.get(`${API_URL}/message/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Garantir que retornamos sempre um array
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && typeof response.data === "object") {
        console.warn("⚠️ API retornou objeto em vez de array, convertendo...")
        // Se a API retornar um objeto com uma propriedade que contém o array
        const possibleArray = response.data.messages || response.data.data || response.data.content || []
        return Array.isArray(possibleArray) ? possibleArray : []
      } else {
        console.warn("⚠️ API retornou dados inesperados, retornando array vazio")
        return []
      }
    } catch (error) {
      console.error("❌ Erro ao buscar mensagens:", error)
      throw error
    }
  },

  // Método para obter áudio através do backend (proxy)
  getAudioStream: async (audioUrl: string): Promise<Blob> => {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Token de autenticação não encontrado")
    }

    try {
      // Extrair o nome do arquivo da URL do S3
      const fileName = audioUrl.split("/").pop()
      if (!fileName) {
        throw new Error("Nome do arquivo não encontrado na URL")
      }

      // Fazer requisição para o backend que atuará como proxy
      const response = await axios.get(`${API_URL}/audio/stream/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Importante: receber como blob
      })

      return response.data
    } catch (error) {
      console.error("❌ Erro ao obter stream de áudio:", error)
      throw error
    }
  },

  // Método alternativo: tentar acessar diretamente, se falhar usar proxy
  getAudioWithFallback: async (audioUrl: string): Promise<Blob> => {
    try {
      // Primeiro, tentar acessar diretamente
      console.log("🔍 Tentando acessar áudio diretamente...")
      const response = await fetch(audioUrl)

      if (response.ok) {
        console.log("✅ Áudio acessado diretamente com sucesso")
        return await response.blob()
      } else {
        console.log("⚠️ Acesso direto falhou, usando proxy...")
        return await messageService.getAudioStream(audioUrl)
      }
    } catch (error) {
      console.log("⚠️ Erro no acesso direto, usando proxy...")
      return await messageService.getAudioStream(audioUrl)
    }
  },

  // Método que tenta múltiplas estratégias
  getAudioMultiStrategy: async (audioUrl: string): Promise<Blob> => {
    const strategies = [
      // Estratégia 1: Acesso direto
      async () => {
        console.log("🔍 Estratégia 1: Acesso direto...")
        const response = await fetch(audioUrl)
        if (response.ok) return await response.blob()
        throw new Error("Acesso direto falhou")
      },

      // Estratégia 2: Proxy do backend
      async () => {
        console.log("🔍 Estratégia 2: Proxy do backend...")
        return await messageService.getAudioStream(audioUrl)
      },

      // Estratégia 3: CORS proxy público (fallback)
      async () => {
        console.log("🔍 Estratégia 3: CORS proxy público...")
        const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${audioUrl}`
        const response = await fetch(corsProxyUrl)
        if (response.ok) return await response.blob()
        throw new Error("CORS proxy falhou")
      },

      // Estratégia 4: Outro CORS proxy
      async () => {
        console.log("🔍 Estratégia 4: Outro CORS proxy...")
        const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(audioUrl)}`
        const response = await fetch(corsProxyUrl)
        if (response.ok) return await response.blob()
        throw new Error("Segundo CORS proxy falhou")
      },
    ]

    // Tentar cada estratégia em sequência
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🚀 Tentando estratégia ${i + 1}...`)
        const result = await strategies[i]()
        console.log(`✅ Estratégia ${i + 1} funcionou!`)
        return result
      } catch (error) {
        console.log(`❌ Estratégia ${i + 1} falhou:`, error instanceof Error ? error.message : String(error))

        // Se for a última estratégia, lançar erro
        if (i === strategies.length - 1) {
          throw new Error("Todas as estratégias falharam")
        }
      }
    }

    throw new Error("Nenhuma estratégia funcionou")
  },
}
