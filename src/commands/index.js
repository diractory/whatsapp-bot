const { cmdsCommand } = require("./cmds");
const { pingCommand } = require("./ping");
const { ownerCommand } = require("./owner");
const { fixCommand } = require("./fix");
const { fixlogCommand } = require("./fixlog");
const { setaiCommand } = require("./setai");
const { aiCommand } = require("./ai");
const { aliveCommand, aboutCommand } = require("./extra");
const { bold, withFooter } = require("../utils/formatting");
const aiState = require("../store/aiState");
const { logger } = require("../utils/logger");

const PREFIX = process.env.BOT_PREFIX || ".";
const startedAt = Date.now();

/**
 * Parses "<prefix><command> <rest of text>" -> { command, args }
 */
function parseCommand(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith(PREFIX)) return null;
  const withoutPrefix = trimmed.slice(PREFIX.length);
  const [command, ...rest] = withoutPrefix.split(/\s+/);
  return { command: command.toLowerCase(), args: rest.join(" ") };
}

/**
 * Main entry point called for every incoming text message.
 * Returns the string to send back, or null if nothing should be sent.
 */
async function handleMessage({ chatId, text, sockGetter }) {
  const parsed = parseCommand(text);

  if (parsed) {
    const { command, args } = parsed;
    const t0 = Date.now();

    try {
      switch (command) {
        case "cmds":
        case "menu":
        case "help":
          return cmdsCommand(PREFIX);

        case "ping":
          return pingCommand(startedAt, Date.now() - t0 || 1);

        case "owner":
          return ownerCommand();

        case "alive":
          return aliveCommand();

        case "about":
          return aboutCommand();

        case "fix":
          return await fixCommand(chatId, sockGetter, PREFIX);

        case "fixlog":
          return fixlogCommand(args.trim().toLowerCase());

        case "setai":
          return setaiCommand(chatId, args.trim().toLowerCase());

        case "reset":
          aiState.clearHistory(chatId);
          return withFooter(bold("MEMORY CLEARED\n\nThis chat's AI conversation memory has been reset."));

        case "ai":
          return await aiCommand(chatId, args);

        default:
          return withFooter(
            bold(`UNKNOWN COMMAND: "${command}"\n\nSend ${PREFIX}cmds to see everything I can do.`)
          );
      }
    } catch (err) {
      logger.error(`Command "${command}" crashed`, err);
      return withFooter(
        bold(
          `SOMETHING WENT WRONG\n\nThat command hit an unexpected error and it's been logged.\nRun ${PREFIX}fixlog to see details, or ${PREFIX}fix to try an auto-repair.`
        )
      );
    }
  }

  // Not a command — only respond if this chat has opted in via .setai on
  if (aiState.isAIEnabled(chatId)) {
    return await aiCommand(chatId, text);
  }

  return null; // stay silent otherwise
}

module.exports = { handleMessage, PREFIX };
