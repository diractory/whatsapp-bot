const { bold, withFooter } = require("../utils/formatting");

function cmdsCommand(prefix) {
  const text =
    `𝗥𝗔𝗗𝗛𝗘𝗬 𝗔𝗜 𝗕𝗢𝗧 — COMMAND LIST\n\n` +
    `${prefix}cmds\nShow this list of commands.\n\n` +
    `${prefix}ping\nCheck if the bot is alive and see response speed.\n\n` +
    `${prefix}owner\nShow the owner/master's contact details.\n\n` +
    `${prefix}setai on\nEnable AI chat mode in this chat. Every message you send after this will be answered by AI.\n\n` +
    `${prefix}setai off\nDisable AI chat mode in this chat.\n\n` +
    `${prefix}setai <groq|gemini|openai|openrouter>\nSwitch which AI provider answers you, e.g. "${prefix}setai gemini".\n\n` +
    `${prefix}ai <question>\nAsk the AI a single question without turning on AI mode for the whole chat.\n\n` +
    `${prefix}reset\nClear this chat's AI conversation memory.\n\n` +
    `${prefix}fix\nAttempt to auto-repair the bot (clears stuck state, restarts internal services).\n\n` +
    `${prefix}fixlog\nShow the most recent errors captured by the bot, and what to do about them.\n\n` +
    `${prefix}fixlog clear\nWipe the stored logs.\n\n` +
    `Note: AI replies are sent as plain text (as requested). Every other bot reply is bold.`;
  return withFooter(bold(text));
}

module.exports = { cmdsCommand };
