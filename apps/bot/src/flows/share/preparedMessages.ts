import type { Context } from "grammy";

export const SHARE_TEMPLATES = {
  daily: (cardName: string, insight: string) => 
    `🃏 Карта дня: ${cardName}\n\n💭 ${insight}\n\nОткрыть МАК: https://t.me/alfamayakbot/mac`,
  
  spread: (spreadName: string, cardsCount: number) =>
    `🔮 Я сделал(а) расклад «${spreadName}» (${cardsCount} карт)\n\nПопробуй и ты: https://t.me/alfamayakbot/mac`,
};

export async function handleShare(ctx: Context) {
  await ctx.reply("Выбери, чем поделиться:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🃏 Картой дня", callback_data: "share_daily" }],
        [{ text: "🔮 Раскладом", callback_data: "share_spread" }],
      ],
    },
  });
}
