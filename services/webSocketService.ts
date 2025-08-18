import SockJS from "sockjs-client"
import { Client, type Message } from "@stomp/stompjs"
import type { MessageResponseDTO } from "@/types/message" // Certifique-se que este tipo existe
import { websocketConfig } from "@/lib/websocket-config" // Supondo que você tenha este arquivo

// Interface para os parâmetros de conexão, para ficar mais limpo
interface ConnectParams {
  userSlug: string
  token: string
  onMessageReceived: (message: MessageResponseDTO) => void
}

class WebSocketService {
  private client: Client | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null

  // Armazena os parâmetros para poder reconectar
  private connectionParams: ConnectParams | null = null

  connect({ userSlug, token, onMessageReceived }: ConnectParams): Promise<void> {
    return new Promise((resolve, reject) => {
      // Se já estiver conectado, não faz nada
      if (this.client && this.isConnected) {
        console.log("Já está conectado.")
        resolve()
        return
      }

      // Armazena os parâmetros para futuras reconexões
      this.connectionParams = { userSlug, token, onMessageReceived }

      try {
        // Criar cliente STOMP
        this.client = new Client({
          webSocketFactory: () => new SockJS(websocketConfig.url),

          // =======================================================
          // PARTE MAIS IMPORTANTE: ENVIAR O TOKEN DE AUTENTICAÇÃO
          // =======================================================
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },

          debug: (str) => {
            console.log("STOMP Debug:", str)
          },
          reconnectDelay: websocketConfig.reconnectInterval,
          heartbeatIncoming: websocketConfig.heartbeatInterval,
          heartbeatOutgoing: websocketConfig.heartbeatInterval,
        })

        // Configurar callbacks
        this.client.onConnect = (frame) => {
          console.log("Conectado ao WebSocket:", frame)
          this.isConnected = true
          this.reconnectAttempts = 0

          // Inscrever no tópico de alertas do usuário
          console.log(`o userId é: ${userSlug}`)
          this.client?.subscribe(`/topic/alerts/${userSlug}`, (message: Message) => {
            try {
              const messageData: MessageResponseDTO = JSON.parse(message.body)
              console.log("Nova mensagem recebida:", messageData)
              if (this.connectionParams) {
                this.connectionParams.onMessageReceived(messageData)
              }
            } catch (error) {
              console.error("Erro ao processar mensagem:", error)
            }
          })

          resolve()
        }

        this.client.onStompError = (frame) => {
          console.error("Erro STOMP:", frame.headers["message"], frame.body)
          this.isConnected = false
          reject(new Error(frame.headers.message || "Erro STOMP"))
        }

        this.client.onWebSocketError = (error) => {
          console.error("Erro WebSocket:", error)
          this.isConnected = false
          reject(error)
        }

        this.client.onWebSocketClose = () => {
          console.log("WebSocket fechado")
          this.isConnected = false
          this.handleReconnect()
        }

        // Ativar a conexão
        this.client.activate()
      } catch (error) {
        console.error("Erro ao criar conexão WebSocket:", error)
        reject(error)
      }
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= websocketConfig.reconnectAttempts) {
      console.error("Máximo de tentativas de reconexão atingido")
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`Tentativa de reconexão ${this.reconnectAttempts + 1}/${websocketConfig.reconnectAttempts}`)
      this.reconnectAttempts++

      // Usa os parâmetros salvos para tentar reconectar
      if (this.connectionParams) {
        this.connect(this.connectionParams).catch(() => {
          // A reconexão falhou, a própria lógica de onWebSocketClose vai chamar o handleReconnect de novo
          console.error("Falha na tentativa de reconexão.")
        })
      }
    }, websocketConfig.reconnectInterval)
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.client && this.isConnected) {
      this.client.deactivate()
      console.log("Cliente WebSocket desativado.")
    }

    // Limpa o estado
    this.isConnected = false
    this.client = null
    this.connectionParams = null
  }

  isConnectedStatus(): boolean {
    return this.isConnected
  }
}

// Exporta uma única instância do serviço (Padrão Singleton)
export const webSocketService = new WebSocketService()
