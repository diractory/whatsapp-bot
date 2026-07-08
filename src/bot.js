const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const path = require("path");
const { logger, baileysLogger } = require("./utils/logger");
const { handleMessage } = require("./commands");

const SESSION_DIR = path.join(process.cwd(), process.env.SESSION_DIR || "auth_info");

let currentSock = null;
let latestQR = null; // data URL-ready raw QR string, consumed by the web server
let connectionStatus = "starting"; // starting | qr | connected | disconnected

function getSock() {
  return currentSock;
}
function getQR() {
  return latestQR;
}
function getStatus() {
  return connectionStatus;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: baileysLogger,
    printQRInTerminal: false,
    browser: ["RADHEY AI Bot", "Chrome", "1.0.0"],
  });

  currentSock = sock;

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQR = qr;
      connectionStatus = "qr";
      logger.info("New QR code generated — visit /qr to scan it.");
    }

    if (connection === "open") {
      latestQR = null;
      connectionStatus = "connected";
      logger.info(`Connected to WhatsApp as ${sock.user?.id}`);
    }

    if (connection === "close") {
      connectionStatus = "disconnected";
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(`Connection closed (code ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        startBot().catch((err) => logger.error("Reconnect failed", err));
      } else {
        logger.error("Logged out from WhatsApp. Delete the session folder and re-scan the QR to log in again.");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;

        const chatId = msg.key.remoteJid;
        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          "";

        if (!text) continue;

        const reply = await handleMessage({ chatId, text, sockGetter: getSock });
        if (reply) {
          await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
        }
      } catch (err) {
        logger.error("Failed handling incoming message", err);
      }
    }
  });

  return sock;
}

module.exports = { startBot, getSock, getQR, getStatus };
