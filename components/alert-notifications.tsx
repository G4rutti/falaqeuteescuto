"use client";

import { useEffect, useState, useRef } from "react";
import type { MessageResponseDTO } from "@/types/message";
import { Card } from "@/components/ui/card";
import { User, Volume2 } from "lucide-react";

interface AlertNotificationProps {
  message: MessageResponseDTO;
  onComplete: () => void;
}

export function AlertNotification({
  message,
  onComplete,
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Inicia a animação de entrada
    const enterTimer = setTimeout(() => setIsVisible(true), 100);

    // 2. Prepara e toca o áudio
    if (message.audioUrl) {
      console.log("Preparando áudio:", message.audioUrl);
      const audio = new Audio(message.audioUrl);
      audioRef.current = audio;

      // Adicionamos um listener para começar a tocar quando o áudio estiver pronto
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Erro ao iniciar o autoplay do áudio:", error);
        });
      }
    }

    // 3. Agenda o desaparecimento do alerta
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsVisible(false); // inicia animação de saída
        setTimeout(onComplete, 500);
      };
    }

    // 4. Função de limpeza
    return () => {
      console.log("Limpando efeito...");
      clearTimeout(enterTimer);

      // Garante que o áudio pare se o componente for desmontado
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [message, onComplete]);

  const truncateMessage = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`
      fixed top-8 right-8 z-50 pointer-events-none
      transform transition-all duration-500 ease-out
      ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }
    `}
    >
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg max-w-sm h-[auto]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-gray-900">
                  {message.streamerSlug || "anônimo"}
                </span>
                {message.donationAmount && (
                  <span className="text-sm font-medium text-green-600">
                    mandou R${" "}
                    {message.donationAmount.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {truncateMessage(message.texto)}
              </p>

              {message.audioUrl && (
                <div className="mt-2 flex items-center gap-1 text-xs text-cyan-500">
                  <Volume2 className="w-3 h-3" />
                  <span>Reproduzindo áudio</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
