import { Bot, webhookCallback } from "grammy";
import handleStart from "../src/flows/start";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.command("start", handleStart);
bot.command("help", async (ctx) => ctx.reply("Напиши /start"));

export default webhookCallback(bot, "https");
