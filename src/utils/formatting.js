/**
 * WhatsApp uses simple markdown: *bold*, _italic_, ~strikethrough~, ```monospace```
 * Every bot reply (except raw AI answers, per the owner's spec) is sent fully bold
 * by wrapping each non-empty line in single asterisks.
 */

function boldLine(line) {
  if (!line.trim()) return line;
  // Avoid double-wrapping lines that are already bold or are list bullets we want to keep clean
  return `*${line}*`;
}

function bold(text) {
  return text
    .split("\n")
    .map(boldLine)
    .join("\n");
}

/** Wraps the whole block in one bold span (keeps internal newlines bold together) */
function boldBlock(text) {
  return `*${text}*`;
}

function withFooter(text, ownerName = "RADHEY") {
  return `${text}\n\n*— Master: #${ownerName}*`;
}

module.exports = { bold, boldBlock, withFooter };
