"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Copy,
  ExternalLink,
  Wifi,
  WifiOff,
  MessageSquare,
  Clock,
  Play,
  Pause,
  LogOut,
  Settings,
  BarChart3,
  Bell,
} from "lucide-react"
import { useAuth } from "@/lib/auth-hook"
import { messageService } from "@/services/messageService"
import { webSocketService } from "@/services/webSocketService"
import type { MessageResponseDTO } from "@/types/message"
import { ProtectedRoute } from "@/components/protected-route"

interface DashboardStats {
  totalMessages: number
  alertsInQueue: number
  isConnected: boolean
  todayMessages: number
}

export default function DashboardPage() {
  const { user, logout, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    alertsInQueue: 0,
    isConnected: false,
    todayMessages: 0,
  })
  const [messages, setMessages] = useState<MessageResponseDTO[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const widgetUrl = user ? `${window.location.origin}/widget/${user.slug}?token=${token}` : ""

  useEffect(() => {
    loadMessages()
    if (user && token) {
      connectWebSocket()
    }

    return () => {
      webSocketService.disconnect()
    }
  }, [user, token])

  const connectWebSocket = async () => {
    if (!user || !token) return

    setIsConnecting(true)
    setConnectionError(null)

    try {
      await webSocketService.connect({
        userSlug: user.slug,
        token: token,
        onMessageReceived: handleNewMessage,
      })

      setStats((prev) => ({ ...prev, isConnected: true }))
      toast.success("Conectado ao WebSocket! Você receberá alertas em tempo real.")
    } catch (error) {
      console.error("Erro ao conectar WebSocket:", error)
      setConnectionError(error instanceof Error ? error.message : "Erro na conexão")
      setStats((prev) => ({ ...prev, isConnected: false }))
      toast.error("Erro ao conectar com o servidor de alertas")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleNewMessage = (newMessage: MessageResponseDTO) => {
    console.log("Nova mensagem recebida via WebSocket:", newMessage)

    // Add new message to the list
    setMessages((prev) => [newMessage, ...prev])

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      todayMessages: prev.todayMessages + 1,
      alertsInQueue: prev.alertsInQueue + 1,
    }))

    // Show notification
    toast.success(
      `Nova mensagem de ${newMessage.userName || "Anônimo"}: ${newMessage.texto.substring(0, 50)}${newMessage.texto.length > 50 ? "..." : ""}`,
      {
        icon: <Bell className="h-4 w-4" />,
        duration: 5000,
      },
    )

    // Play notification sound (optional)
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        const audio = new Audio("/notification.mp3") // You can add a notification sound file
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore audio play errors (user interaction required)
        })
      } catch (error) {
        // Ignore audio errors
      }
    }
  }

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const messagesData = await messageService.getMyMessages()
      setMessages(messagesData)

      // Calculate stats
      const today = new Date().toDateString()
      const todayMessages = messagesData.filter((msg) => new Date(msg.createdAt || new Date()).toDateString() === today).length

      setStats((prev) => ({
        ...prev,
        totalMessages: messagesData.length,
        todayMessages,
      }))
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
      toast.error("Erro ao carregar histórico de mensagens")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
      toast.success("URL copiada para a área de transferência!")
    } catch (error) {
      console.error("Erro ao copiar:", error)
      toast.error("Erro ao copiar URL")
    }
  }

  const playAudio = async (audioUrl: string, messageId: string) => {
    if (playingAudio === messageId) {
      // Stop current audio
      setPlayingAudio(null)
      return
    }

    try {
      setPlayingAudio(messageId)

      const audioBlob = await messageService.getAudioMultiStrategy(audioUrl)
      const audioObjectUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioObjectUrl)
      audio.onended = () => {
        setPlayingAudio(null)
        URL.revokeObjectURL(audioObjectUrl)
      }
      audio.onerror = () => {
        setPlayingAudio(null)
        URL.revokeObjectURL(audioObjectUrl)
        toast.error("Erro ao reproduzir áudio")
      }

      await audio.play()
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error)
      setPlayingAudio(null)
      toast.error("Erro ao reproduzir áudio")
    }
  }

  const reconnectWebSocket = () => {
    webSocketService.disconnect()
    connectWebSocket()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" alt={user?.email} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Bem-vindo, {user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Connection Status Card - Most Prominent */}
          <Card className="mb-8 bg-card border-border/40 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    {stats.isConnected ? (
                      <Wifi className="h-5 w-5 text-green-400" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-destructive" />
                    )}
                    Status da Conexão
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Conexão WebSocket para alertas em tempo real
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={stats.isConnected ? "secondary" : "destructive"} className="text-sm">
                    {isConnecting ? "Conectando..." : stats.isConnected ? "Conectado" : "Desconectado"}
                  </Badge>
                  {!stats.isConnected && !isConnecting && (
                    <Button variant="outline" size="sm" onClick={reconnectWebSocket}>
                      Reconectar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectionError && (
                  <Alert variant="destructive">
                    <AlertDescription>Erro de conexão: {connectionError}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">URL do seu canal:</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-input rounded-md border border-border text-foreground font-mono text-sm overflow-hidden">
                      {widgetUrl}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(widgetUrl)} className="shrink-0">
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" asChild className="shrink-0 bg-transparent">
                      <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Mensagens</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalMessages}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensagens Hoje</p>
                    <p className="text-3xl font-bold text-foreground">{stats.todayMessages}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alertas na Fila</p>
                    <p className="text-3xl font-bold text-foreground">{stats.alertsInQueue}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages History */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground">Histórico de Mensagens</CardTitle>
              <CardDescription className="text-muted-foreground">
                Todas as mensagens recebidas dos seus espectadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Carregando mensagens...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma mensagem recebida ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Compartilhe sua URL para começar a receber mensagens!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Mensagem</TableHead>
                        <TableHead className="text-foreground">Data</TableHead>
                        <TableHead className="text-foreground">Áudio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="text-foreground max-w-md">
                            <div className="truncate" title={message.texto}>
                              {message.texto}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(message.createdAt!)}</TableCell>
                          <TableCell>
                            {message.audioUrl ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => playAudio(message.audioUrl!, message.id)}
                                className="text-primary hover:text-accent"
                              >
                                {playingAudio === message.id ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem áudio</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
