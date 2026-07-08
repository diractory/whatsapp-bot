const fs = require("fs");
const path = require("path");
const pino = require("pino");

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "bot.log");
const ERROR_FILE = path.join(LOG_DIR, "errors.log");

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "");
if (!fs.existsSync(ERROR_FILE)) fs.writeFileSync(ERROR_FILE, "");

// Silent pino logger for Baileys internals (keeps console clean)
const baileysLogger = pino({ level: "silent" });

function timestamp() {
  return new Date().toISOString();
}

function writeLine(file, line) {
  fs.appendFile(file, line + "\n", (err) => {
    if (err) console.error("Logger write failed:", err.message);
  });
}

const logger = {
  info(msg) {
    const line = `[${timestamp()}] [INFO] ${msg}`;
    console.log(line);
    writeLine(LOG_FILE, line);
  },
  warn(msg) {
    const line = `[${timestamp()}] [WARN] ${msg}`;
    console.warn(line);
    writeLine(LOG_FILE, line);
  },
  error(msg, err) {
    const detail = err && err.stack ? err.stack : err ? String(err) : "";
    const line = `[${timestamp()}] [ERROR] ${msg}${detail ? " | " + detail : ""}`;
    console.error(line);
    writeLine(LOG_FILE, line);
    writeLine(ERROR_FILE, line);
  },
  /** Returns the last N lines of the error log (for .fixlog) */
  getLastErrors(n = 15) {
    try {
      const content = fs.readFileSync(ERROR_FILE, "utf8").trim();
      if (!content) return [];
      return content.split("\n").slice(-n);
    } catch {
      return [];
    }
  },
  /** Returns the last N lines of the full log (for .fixlog all) */
  getLastLogs(n = 30) {
    try {
      const content = fs.readFileSync(LOG_FILE, "utf8").trim();
      if (!content) return [];
      return content.split("\n").slice(-n);
    } catch {
      return [];
    }
  },
  clearLogs() {
    fs.writeFileSync(LOG_FILE, "");
    fs.writeFileSync(ERROR_FILE, "");
  },
};

module.exports = { logger, baileysLogger, LOG_FILE, ERROR_FILE };
