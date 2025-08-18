"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { config } from "./config";

interface User {
  email: string;
  slug: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Marcar quando estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Só executar no cliente
    if (!isClient) return;

    try {
      // Verificar se há um token salvo no localStorage OU cookies
      const savedToken =
        localStorage.getItem(config.storage.authToken) ||
        getCookie(config.storage.authToken);
      const savedUser =
        localStorage.getItem(config.storage.user) ||
        getCookie(config.storage.user);

      if (savedToken && savedUser) {
        try {
          const userData =
            typeof savedUser === "string" ? JSON.parse(savedUser) : savedUser;
          setToken(savedToken);
          setUser(userData);
          console.log(
            "✅ Token encontrado, usuário autenticado:",
            userData.name
          );
        } catch {
          console.log(savedToken, savedUser);
          console.error("❌ Erro ao parsear dados do usuário");
          // Se houver erro, limpar dados inválidos
          localStorage.removeItem(config.storage.authToken);
          localStorage.removeItem(config.storage.user);
          removeCookie(config.storage.authToken);
          removeCookie(config.storage.user);
        }
      } else {
        console.log("❌ Nenhum token encontrado, usuário não autenticado");
      }
    } catch (error) {
      console.error("❌ Erro ao verificar autenticação:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  const login = (authToken: string, slug: string, email: string) => {
    console.log(`USER É: ${slug}, ${email}`);
    console.log("[v0] 🔐 Iniciando processo de login...");
    console.log("[v0] 📝 Dados do usuário:", slug, email);
    console.log(
      "[v0] 🔑 Token recebido:",
      authToken ? "✅ Presente" : "❌ Ausente"
    );

    // Salvar no localStorage
    localStorage.setItem(config.storage.authToken, authToken);
    localStorage.setItem(config.storage.user, JSON.stringify({slug, email}));

    // Salvar nos cookies também
    setCookie(config.storage.authToken, authToken, { expires: 7 });
    setCookie(config.storage.user, JSON.stringify({slug, email}), { expires: 7 });

    // Atualizar estado
    setToken(authToken);
    setUser({slug, email});

    console.log("[v0] 💾 Dados salvos no localStorage e cookies");
    console.log("[v0] 🔄 Redirecionando para dashboard...");

    // Tentar usar o router primeiro, se falhar usar window.location
    try {
      router.push("/dashboard");
      console.log(
        "[v0] 🚀 Redirecionamento via router executado para /dashboard"
      );
    } catch {
      console.log("[v0] ⚠️ Router falhou, usando window.location");
      window.location.href = "/dashboard";
    }
  };

  const logout = () => {
    console.log("[v0] 🚪 Iniciando logout...");

    // Limpar localStorage
    localStorage.removeItem(config.storage.authToken);
    localStorage.removeItem(config.storage.user);

    // Limpar cookies
    removeCookie(config.storage.authToken);
    removeCookie(config.storage.user);

    // Limpar estado
    setToken(null);
    setUser(null);

    console.log("[v0] 🧹 Dados limpos, redirecionando para login...");

    try {
      router.push("/login");
    } catch {
      console.log("[v0] ⚠️ Router falhou, usando window.location");
      window.location.href = "/login";
    }
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading: isLoading || !isClient,
    isAuthenticated,
    login,
    logout,
  };
}

// Funções auxiliares para cookies (só executam no cliente)
function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

function setCookie(
  name: string,
  value: string,
  options: {
    expires?: number;
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
) {
  if (typeof window === "undefined") return;

  const {
    expires = 7,
    path = "/",
    secure = true,
    sameSite = "strict",
  } = options;

  const date = new Date();
  date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);

  const cookieString = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${date.toUTCString()}`,
    `path=${path}`,
    secure ? "secure" : "",
    `samesite=${sameSite}`,
  ]
    .filter(Boolean)
    .join("; ");

  document.cookie = cookieString;
}

function removeCookie(name: string, path = "/") {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}
