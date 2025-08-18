export const config = {
  api: {
    baseUrl: "https://falaqeuteescuto-backend.onrender.com",
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
