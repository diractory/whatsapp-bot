require("dotenv").config();
const express = require("express");
const path = require("path");
const QRCode = require("qrcode");
const { startBot, getQR, getStatus, getSock } = require("./src/bot");
const { logger } = require("./src/utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "qr.html"));
});

app.get("/qr", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "qr.html"));
});

app.get("/api/status", (req, res) => {
  const sock = getSock();
  res.json({
    status: getStatus(),
    user: sock?.user?.id ? sock.user.id.split(":")[0] : null,
  });
});

app.get("/api/qr-image", async (req, res) => {
  const qr = getQR();
  if (!qr) {
    return res.status(404).send("No QR available right now");
  }
  try {
    const buffer = await QRCode.toBuffer(qr, { width: 500, margin: 1 });
    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    logger.error("Failed generating QR image", err);
    res.status(500).send("Failed generating QR image");
  }
});

// Simple health check for Render
app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.listen(PORT, () => {
  logger.info(`Web server listening on port ${PORT}`);
  logger.info(`Open the app's URL in your browser to scan the WhatsApp QR code.`);
});

startBot().catch((err) => {
  logger.error("Fatal error starting bot", err);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
});
