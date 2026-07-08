const { bold, withFooter } = require("../utils/formatting");

function pingCommand(startedAt, tookMs) {
  const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);
  const h = Math.floor(uptimeSec / 3600);
  const m = Math.floor((uptimeSec % 3600) / 60);
  const s = uptimeSec % 60;
  const text =
    `PONG! 🏓\n\n` +
    `Response time: ${tookMs}ms\n` +
    `Uptime: ${h}h ${m}m ${s}s\n` +
    `Status: Online ✅`;
  return withFooter(bold(text));
}

module.exports = { pingCommand };
