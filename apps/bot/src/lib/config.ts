export const config = {
  botToken: process.env.BOT_TOKEN,
  miniAppDeeplink: process.env.MINIAPP_DEEPLINK || "https://t.me/alfamayakbot/mac",
  isProduction: process.env.NODE_ENV === "production",
};
