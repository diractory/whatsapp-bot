const { logger } = require("../utils/logger");
const { bold, withFooter } = require("../utils/formatting");
const aiState = require("../store/aiState");

/**
 * .fix does a set of safe, non-destructive repair actions:
 *  1. Clears any AI history that might be stuck in a bad loop for this chat.
 *  2. Forces Node's garbage collector if available.
 *  3. Reports whether the WhatsApp socket is currently open.
 *  4. Logs the action so it shows up in .fixlog history.
 */
async function fixCommand(chatId, sockGetter, prefix = ".") {
  const steps = [];

  try {
    aiState.clearHistory(chatId);
    steps.push("✔ Cleared AI memory for this chat");
  } catch (err) {
    steps.push("✘ Could not clear AI memory");
    logger.error("fixCommand: failed clearing AI memory", err);
  }

  try {
    if (global.gc) {
      global.gc();
      steps.push("✔ Forced memory cleanup");
    } else {
      steps.push("• Memory cleanup skipped (start Node with --expose-gc to enable)");
    }
  } catch (err) {
    steps.push("✘ Memory cleanup failed");
    logger.error("fixCommand: gc failed", err);
  }

  try {
    const sock = sockGetter();
    const connected = !!sock?.user;
    steps.push(connected ? "✔ WhatsApp connection: healthy" : "✘ WhatsApp connection: not ready");
  } catch (err) {
    steps.push("✘ Could not check WhatsApp connection");
    logger.error("fixCommand: socket check failed", err);
  }

  logger.info(`.fix run for chat ${chatId}`);

  const text =
    `RUNNING SELF-REPAIR\n\n` +
    steps.join("\n") +
    `\n\nIf problems continue, run ${prefix}fixlog to see recent errors.`;
  return withFooter(bold(text));
}

module.exports = { fixCommand };
