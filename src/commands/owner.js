const { bold, withFooter } = require("../utils/formatting");

function ownerCommand() {
  const text =
    `OWNER DETAILS\n\n` +
    `Name: #𝗥𝗔𝗗𝗛𝗘𝗬 [ Tg ]\n` +
    `Telegram: t.me/youradhey\n` +
    `Role: Python developer\n` +
    `Bio: A normal person trying to do best\n` +
    `Contact: +91 93951 37349\n\n` +
    `This bot is owned and operated by #𝗥𝗔𝗗𝗛𝗘𝗬.`;
  return withFooter(bold(text));
}

module.exports = { ownerCommand };
