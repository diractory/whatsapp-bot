const { bold, withFooter } = require("../utils/formatting");
const aiState = require("../store/aiState");
const { PROVIDERS } = require("../ai/providers");

function setaiCommand(chatId, arg) {
  const validProviders = Object.keys(PROVIDERS);

  if (!arg || (arg !== "on" && arg !== "off" && !validProviders.includes(arg))) {
    const text =
      `HOW TO USE .setai\n\n` +
      `.setai on — turn AI mode ON for this chat (every message you send gets an AI reply)\n` +
      `.setai off — turn AI mode OFF\n` +
      `.setai ${validProviders.join("|")} — choose which AI provider to use\n\n` +
      `Current status: ${aiState.isAIEnabled(chatId) ? "ON" : "OFF"} (provider: ${aiState.getProvider(chatId)})`;
    return withFooter(bold(text));
  }

  if (arg === "on") {
    aiState.setAIEnabled(chatId, true);
    return withFooter(
      bold(
        `AI MODE ENABLED ✅\n\nEvery message you send in this chat will now be answered by AI (provider: ${aiState.getProvider(
          chatId
        )}).\nSend ".setai off" any time to stop.`
      )
    );
  }

  if (arg === "off") {
    aiState.setAIEnabled(chatId, false);
    return withFooter(bold("AI MODE DISABLED ❌\n\nThis chat's messages will no longer be sent to AI."));
  }

  // switching provider
  aiState.setAIEnabled(chatId, aiState.isAIEnabled(chatId), arg);
  return withFooter(bold(`AI PROVIDER SWITCHED\n\nThis chat will now use: ${arg}`));
}

module.exports = { setaiCommand };
