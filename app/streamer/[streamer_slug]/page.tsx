"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Mic, Heart, MessageSquare, CheckCircle } from "lucide-react"
import { messageService } from "@/services/messageService"

const messageSchema = z.object({
  text: z.string().min(1, "Mensagem não pode estar vazia").max(500, "Mensagem muito longa (máximo 500 caracteres)"),
  donationAmount: z.number().min(0, "Valor deve ser positivo").optional(),
})

type MessageFormData = z.infer<typeof messageSchema>

interface StreamerInfo {
  name: string
  slug: string
  avatar?: string
  isOnline?: boolean
  description?: string
}

export default function StreamerPage() {
  const params = useParams()
  const streamerSlug = params.streamer_slug as string

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [streamerInfo, setStreamerInfo] = useState<StreamerInfo>({
    name: streamerSlug.charAt(0).toUpperCase() + streamerSlug.slice(1),
    slug: streamerSlug,
    isOnline: true,
    description: "Streamer ativo na plataforma",
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  })

  const watchedText = watch("text")
  const characterCount = watchedText?.length || 0

  const onSubmit = async (data: MessageFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      await messageService.sendMessage({
        text: data.text,
        slug: streamerSlug,
        // amount: data.donationAmount || 0, // Uncomment when donations are implemented
      })

      setSuccess(true)
      reset()

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={streamerInfo.avatar || "/placeholder.svg"} alt={streamerInfo.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {streamerInfo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{streamerInfo.name}</h1>
                {streamerInfo.isOnline && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    Online
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{streamerInfo.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Envie uma mensagem</h2>
          <p className="text-muted-foreground text-lg">Sua mensagem aparecerá como um alerta durante a transmissão</p>
        </div>

        <Card className="bg-card border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Nova mensagem para {streamerInfo.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Escreva uma mensagem que será lida em voz alta durante a stream
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    Mensagem enviada com sucesso! Ela aparecerá na stream em breve.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="text" className="text-foreground">
                  Sua mensagem
                </Label>
                <Textarea
                  id="text"
                  placeholder="Digite sua mensagem aqui..."
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
                  {...register("text")}
                />
                <div className="flex justify-between items-center">
                  {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
                  <div className="ml-auto">
                    <span
                      className={`text-sm ${
                        characterCount > 450
                          ? "text-destructive"
                          : characterCount > 400
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {characterCount}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Future donation feature - commented out for now */}
              {/* 
              <div className="space-y-2">
                <Label htmlFor="donationAmount" className="text-foreground">
                  Valor da doação (opcional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">R$</span>
                  <Input
                    id="donationAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pl-10"
                    {...register("donationAmount", { valueAsNumber: true })}
                  />
                </div>
                {errors.donationAmount && (
                  <p className="text-sm text-destructive">{errors.donationAmount.message}</p>
                )}
              </div>
              */}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-accent text-primary-foreground py-6 text-lg"
                disabled={isLoading || characterCount === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando mensagem...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar mensagem
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-card/50 border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Como funciona</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Sua mensagem será convertida em áudio e aparecerá como um alerta durante a transmissão ao vivo.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Apoie o streamer</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Suas mensagens ajudam a criar uma experiência mais interativa e divertida para todos.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Fala Que Te Escuto</span>
          </div>
          <p className="text-muted-foreground">Conectando streamers e audiências através de mensagens em tempo real</p>
        </div>
      </footer>
    </div>
  )
}
