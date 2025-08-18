"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mic, Eye, EyeOff, Check } from "lucide-react"
import { authService } from "@/services/auth"
import { useAuth } from "@/lib/auth-hook"

const signupSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    slug: z
      .string()
      .min(3, "Slug deve ter pelo menos 3 caracteres")
      .max(20, "Slug deve ter no máximo 20 caracteres")
      .regex(/^[a-zA-Z0-9_-]+$/, "Slug deve conter apenas letras, números, _ e -"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const watchedSlug = watch("slug")
  const watchedPassword = watch("password")

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await authService.signup({
        name: data.name,
        email: data.email,
        slug: data.slug,
        password: data.password,
      })
      login(response.token, response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" }

    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ["Muito fraca", "Fraca", "Regular", "Boa", "Forte"]
    const colors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

    return { strength, label: labels[strength - 1] || "", color: colors[strength - 1] || "" }
  }

  const passwordStrength = getPasswordStrength(watchedPassword || "")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border/40">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Fala Que Te Escuto</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Crie sua conta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Comece a interagir com sua audiência hoje mesmo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-foreground">
                Slug do streamer
              </Label>
              <div className="relative">
                <Input
                  id="slug"
                  type="text"
                  placeholder="meucanal"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  {...register("slug")}
                />
                {watchedSlug && !errors.slug && <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
              </div>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              {watchedSlug && !errors.slug && (
                <p className="text-sm text-muted-foreground">
                  Sua URL será: <span className="text-primary">/streamer/{watchedSlug}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              {watchedPassword && passwordStrength.strength > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.strength ? passwordStrength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Força da senha: {passwordStrength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:text-accent transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
