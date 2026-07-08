const { askAI } = require("../ai/providers");
const { bold, withFooter } = require("../utils/formatting");
const aiState = require("../store/aiState");
const { logger } = require("../utils/logger");

/**
 * Handles both:
 *  - ".ai <question>"  → one-off question, doesn't require AI mode to be on
 *  - a plain message while AI mode is ON for that chat
 * Per the owner's spec, the AI's own answer is sent as plain (non-bold) text.
 * Everything else in this reply (the small header) stays bold.
 */
async function aiCommand(chatId, question) {
  if (!question || !question.trim()) {
    return withFooter(bold("Please include a question, e.g. \".ai what is the capital of France?\""));
  }

  const provider = aiState.getProvider(chatId);
  const history = aiState.getHistory(chatId);

  try {
    const { reply, providerUsed } = await askAI(question, { provider, history });
    aiState.pushHistory(chatId, "user", question);
    aiState.pushHistory(chatId, "assistant", reply);

    // AI answer stays plain text (not bold) as requested; only the small
    // signature line at the end is bold, matching the rest of the bot.
    return `${reply}\n\n*🤖 via ${providerUsed} — Master: #RADHEY*`;
  } catch (err) {
    logger.error("aiCommand failed", err);
    return withFooter(
      bold(
        `AI ERROR\n\nCouldn't get a reply from any configured AI provider.\n${err.message}\n\nAsk the master to check the API keys in .env / Render environment variables.`
      )
    );
  }
}

module.exports = { aiCommand };
