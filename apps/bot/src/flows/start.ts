import type { Context } from "grammy";
import { InlineKeyboard } from "grammy";

const MINIAPP_DEEPLINK = process.env.MINIAPP_DEEPLINK || "https://t.me/alfamayakbot/mac";

export default async function handleStart(ctx: Context) {
  const firstName = ctx.from?.first_name ?? "друг";
  
  const startParam = ctx.match as string | undefined;
  const appUrl = startParam 
    ? `${MINIAPP_DEEPLINK}?startapp=${encodeURIComponent(startParam)}`
    : `${MINIAPP_DEEPLINK}?startapp=daily`;

  const text =
    `Привет, ${firstName}!\n\n` +
    `Это мини‑приложение для самопомощи с метафорическими ассоциативными картами (МАК).\n` +
    `Сформулируй запрос, вытянь карту и запиши выводы.\n\n` +
    `Нажми «Открыть», чтобы начать.`;

  const kb = new InlineKeyboard().url("Открыть", appUrl);

  await ctx.reply(text, { reply_markup: kb });
}
