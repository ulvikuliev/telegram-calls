import { Telegraf } from "telegraf";
import * as crypto from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const BOT_USERNAME = process.env.BOT_USERNAME!; // без @, напр. my_calls_bot
const ROOM_SECRET = process.env.ROOM_SECRET!;

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function randomId(n = 12) {
  return b64url(crypto.randomBytes(n));
}
function sign(rid: string, exp: number) {
  return b64url(
    crypto.createHmac("sha256", ROOM_SECRET).update(`${rid}_${exp}`).digest()
  );
}
function makeToken(ttlSec = 3600) {
  const rid = randomId(12);
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  return `${rid}_${exp}_${sign(rid, exp)}`;
}

const bot = new Telegraf(BOT_TOKEN);

bot.command("call", async (ctx) => {
  const token = makeToken();
  const link = `https://t.me/${BOT_USERNAME}?startapp=${token}`;

  await ctx.reply(
    [
      "🎥 Создан приватный звонок.",
      "Перешли это сообщение собеседнику и оба откройте ссылку:",
      link,
    ].join("\n")
  );

  // (опционально) кнопка для автора — в пересылке исчезнет, это норм
  await ctx.reply("Открыть звонок", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Запустить",
            web_app: { url: process.env.WEBAPP_URL || "https://example.com" },
          },
        ],
      ],
    },
  });
});

bot.launch();
console.log("Bot started");
