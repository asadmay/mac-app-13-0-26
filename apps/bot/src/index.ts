import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

import { Bot } from "grammy";
import handleStart from "./flows/start";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is not set in apps/bot/.env");

const bot = new Bot(token);

bot.command("start", handleStart);
bot.command("help", async (ctx) => {
  await ctx.reply("Нажми /start и открой мини‑приложение по кнопке.");
});

bot.on("message:text", async (ctx) => {
  await ctx.reply("Напиши /start, чтобы открыть приложение.");
});

bot.catch((err) => console.error("BOT_ERROR", err));

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

(async () => {
  await bot.api.deleteWebhook({ drop_pending_updates: true });
  bot.start({ drop_pending_updates: true });
  console.log("Bot started with polling");
})();
