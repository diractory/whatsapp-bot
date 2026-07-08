const { logger } = require("../utils/logger");
const { bold, withFooter } = require("../utils/formatting");

function fixlogCommand(arg) {
  if (arg === "clear") {
    logger.clearLogs();
    return withFooter(bold("LOGS CLEARED\n\nAll stored bot logs and error logs have been wiped."));
  }

  const errors = logger.getLastErrors(10);

  if (errors.length === 0) {
    return withFooter(bold("NO ERRORS FOUND\n\nThe bot has not recorded any errors recently. Everything looks clean ✅"));
  }

  const formatted = errors
    .map((line, i) => `${i + 1}. ${line.replace(/^\[.*?\]\s*/, "")}`)
    .join("\n\n");

  const text =
    `RECENT ERRORS (last ${errors.length})\n\n` +
    `${formatted}\n\n` +
    `Tip: most errors here are caused by a missing/invalid AI API key, a lost WhatsApp connection, ` +
    `or a network timeout. Re-check your .env values and re-deploy if needed.`;

  return withFooter(bold(text));
}

module.exports = { fixlogCommand };
