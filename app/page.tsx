import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Zap,
  BarChart3,
  Users,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import DarkVeil from "@/components/reactbits/DarkVeil/DarkVeil";
import ShinyText from "@/components/reactbits/ShinyText/ShinyText";
import AnimatedContent from "@/components/reactbits/AnimatedContent/AnimatedContent";
import { ShinyButton } from "@/components/magicui/shiny-button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Mic className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Fala Que Te Escuto
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary cursor-pointer"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-accent text-primary-foreground cursor-pointer">
                  Comece Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-card md:h-[90vh]">
        <DarkVeil />
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center my-auto">
            <Badge
              variant="secondary"
              className="mb-10 mt-5 bg-primary/10 text-primary border-primary/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma de Streaming Moderna
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Dê voz à sua <ShinyText text="audiência" speed={1} /> em tempo
              real
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transforme mensagens dos seus espectadores em alertas dinâmicos
              durante suas transmissões. Uma experiência interativa que conecta
              você ao seu público como nunca antes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg cursor-pointer"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Cadastre-se Gratuitamente
                </Button>
              </Link>
              <Link href="/streamer/exemplo">
                <ShinyButton
                  className="border-primary/20 text-foreground hover:bg-primary/10 px-8 py-[0.85rem] text-lg bg-transparent"
                >
                  Ver Demonstração
                </ShinyButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Funcionalidades Poderosas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para criar uma experiência de streaming
              interativa e envolvente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedContent delay={0.1}>
              <Card className="bg-card border-border/40 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">
                    Interação em Tempo Real
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Mensagens dos espectadores aparecem instantaneamente como
                    alertas durante sua transmissão
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedContent>

            <AnimatedContent delay={0.3}>
              <Card className="bg-card border-border/40 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-foreground">
                    Alertas Personalizados
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Customize a aparência e o som dos alertas para combinar com
                    o estilo do seu canal
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedContent>

            <AnimatedContent delay={0.4}>
              <Card className="bg-card border-border/40 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">
                    Análise de Engajamento
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Acompanhe estatísticas detalhadas sobre a interação do seu
                    público
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background">
        <AnimatedContent>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Como Funciona
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Três passos simples para começar a interagir com sua audiência
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedContent delay={0.2}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Cadastre-se
                  </h3>
                  <p className="text-muted-foreground">
                    Crie sua conta e configure seu perfil de streamer em minutos
                  </p>
                </div>
              </AnimatedContent>

              <AnimatedContent delay={0.4}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-accent">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Configure
                  </h3>
                  <p className="text-muted-foreground">
                    Personalize seus alertas e compartilhe sua URL
                    /streamer/seucanal com a audiência
                  </p>
                </div>
              </AnimatedContent>

              <AnimatedContent delay={0.6}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Interaja
                  </h3>
                  <p className="text-muted-foreground">
                    Receba mensagens em tempo real e engaje com sua audiência
                  </p>
                </div>
              </AnimatedContent>
            </div>
          </div>
        </AnimatedContent>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Users className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Pronto para revolucionar suas transmissões?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a centenas de streamers que já estão usando nossa
            plataforma para criar experiências únicas
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Comece Gratuitamente Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Mic className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Fala Que Te Escuto
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cadastro
              </Link>
              <Link
                href="/support"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Suporte
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center">
            <p className="text-muted-foreground">
              © 2025 Fala Que Te Escuto. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
