import type { Context } from "grammy";

export async function handleInvoice(ctx: Context) {
  await ctx.reply("Платежи будут доступны в следующем обновлении 💳");
}

export async function createInvoiceLink(ctx: Context, title: string, amount: number) {
  console.log(`Invoice requested: ${title} for ${amount}`);
  return null;
}
