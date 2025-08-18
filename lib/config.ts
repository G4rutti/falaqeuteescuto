export const config = {
  api: {
    baseUrl: "http://localhost:8080",
    endpoints: {
      auth: {
        login: "/auth/login",
        register: "/auth/register",
      },
      messages: {
        send: "/message/send-message",
        getMyMessages: "/message/me",
      },
    },
  },
  storage: {
    authToken: "fqte_auth_token",
    user: "fqte_user",
  },
}
