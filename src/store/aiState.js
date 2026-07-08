const fs = require("fs");
const path = require("path");

const STORE_FILE = path.join(__dirname, "ai_state.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch {
    return { chats: {} };
  }
}

function save(data) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

let state = load();

function isAIEnabled(chatId) {
  return !!state.chats[chatId]?.aiEnabled;
}

function setAIEnabled(chatId, enabled, provider) {
  if (!state.chats[chatId]) state.chats[chatId] = { aiEnabled: false, history: [], provider: null };
  state.chats[chatId].aiEnabled = enabled;
  if (provider) state.chats[chatId].provider = provider;
  if (!enabled) state.chats[chatId].history = [];
  save(state);
}

function getProvider(chatId) {
  return state.chats[chatId]?.provider || process.env.DEFAULT_AI_PROVIDER || "groq";
}

function getHistory(chatId) {
  return state.chats[chatId]?.history || [];
}

function pushHistory(chatId, role, content) {
  if (!state.chats[chatId]) state.chats[chatId] = { aiEnabled: false, history: [], provider: null };
  const h = state.chats[chatId].history;
  h.push({ role, content });
  // Keep only the last 10 turns to control token usage / latency
  state.chats[chatId].history = h.slice(-10);
  save(state);
}

function clearHistory(chatId) {
  if (state.chats[chatId]) {
    state.chats[chatId].history = [];
    save(state);
  }
}

module.exports = { isAIEnabled, setAIEnabled, getProvider, getHistory, pushHistory, clearHistory };
