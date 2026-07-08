const { bold, withFooter } = require("../utils/formatting");

function aliveCommand() {
  return withFooter(bold("I'M ALIVE ⚡\n\nRADHEY's WhatsApp AI Bot is up and running."));
}

function aboutCommand() {
  const text =
    `ABOUT THIS BOT\n\n` +
    `Built with Node.js, Baileys and Express.\n` +
    `Multi-provider AI: Groq, Gemini, OpenAI, OpenRouter.\n` +
    `Hosted on Render.\n\n` +
    `Crafted for #𝗥𝗔𝗗𝗛𝗘𝗬.`;
  return withFooter(bold(text));
}

module.exports = { aliveCommand, aboutCommand };
