"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { webSocketService } from "@/services/webSocketService"
import type { MessageResponseDTO } from "@/types/message"
import axios from "axios"
import { AlertNotification } from "@/components/alert-notifications" // Certifique-se que o caminho está correto
import { VolumeX } from "lucide-react"

interface PublicUserInfo {
  id: string
  name: string
  slug: string
}

export default function WidgetPage() {
  const [alertQueue, setAlertQueue] = useState<MessageResponseDTO[]>([])
  const [currentAlert, setCurrentAlert] = useState<MessageResponseDTO | null>(null)
  
  // Estado que controla se o usuário já interagiu para liberar o áudio
  const [hasInteracted, setHasInteracted] = useState(false)

  const params = useParams()
  const searchParams = useSearchParams()

  const slug = params.streamer_slug as string
  const token = searchParams.get("token")

  // Função para ser chamada no primeiro clique do usuário
  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      console.log("Interação do usuário detectada. O áudio agora pode ser reproduzido automaticamente.");
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  // Efeito para conectar ao WebSocket, AGORA DEPENDE DA INTERAÇÃO
  useEffect(() => {
    if (!slug || !token || !hasInteracted) {
      // Só conecta DEPOIS que o usuário clicar na tela
      return
    }

    let isMounted = true

    const connect = async () => {
      try {
        const response = await axios.get<PublicUserInfo>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/public/${slug}`)
        const userInfo = response.data

        if (!isMounted) return

        await webSocketService.connect({
          userSlug: userInfo.slug,
          token: token,
          onMessageReceived: (message) => {
            setAlertQueue((prev) => [...prev, message])
          },
        })
      } catch (error) {
        console.error("Falha ao inicializar o widget:", error)
      }
    }

    connect()

    return () => {
      isMounted = false
      webSocketService.disconnect()
    }
  }, [slug, token, hasInteracted]) // A dependência `hasInteracted` é a chave aqui

  // Efeito para processar a fila de alertas
  useEffect(() => {
    if (currentAlert === null && alertQueue.length > 0) {
      const nextAlert = alertQueue[0]
      setCurrentAlert(nextAlert)
      setAlertQueue((prev) => prev.slice(1))
    }
  }, [currentAlert, alertQueue])

  const handleAlertComplete = () => {
    setCurrentAlert(null)
  }

  // Se o usuário ainda não interagiu, mostramos a tela de ativação
  if (!hasInteracted) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer"
        onClick={handleUserInteraction} // Permite clicar em qualquer lugar
      >
        <div className="text-center p-8">
          <VolumeX className="mx-auto h-12 w-12 mb-4" />
          <h1 className="text-2xl font-bold">Ativar Áudio</h1>
          <p className="mt-2 text-lg text-gray-300">Clique em qualquer lugar para habilitar os alertas sonoros.</p>
        </div>
      </div>
    );
  }

  // Após a interação, renderiza os alertas em um container com fundo transparente
  return (
    <div style={{ backgroundColor: "transparent" }} className="fixed inset-0 pointer-events-none">
      {currentAlert && <AlertNotification message={currentAlert} onComplete={handleAlertComplete} />}
    </div>
  )
}
