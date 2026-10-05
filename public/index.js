import { createClipboardController } from "./clipboard.js";
import { createMessageView } from "./message-ui.js";
import { createRoomController } from "./room.js";

const socket = io();
const elements = {
    roomForm: document.getElementById("roomForm"),
    createRoomForm: document.getElementById("createRoomForm"),
    messageForm: document.getElementById("messageForm"),
    messageInput: document.getElementById("messageInput"),
    roomInput: document.getElementById("roomInput"),
    roomShare: document.getElementById("roomShare"),
    roomLinkInput: document.getElementById("roomLinkInput"),
    copyRoomLinkBtn: document.getElementById("copyRoomLinkBtn"),
    sendBtn: document.getElementById("sendBtn"),
    messages: document.getElementById("messages"),
    roomStatus: document.getElementById("roomStatus"),
    messageCount: document.getElementById("messageCount"),
    leaveRoomBtn: document.getElementById("leaveRoomBtn"),
    syncClipboardBtn: document.getElementById("syncClipboardBtn"),
    autoSyncClipboardBtn: document.getElementById("autoSyncClipboardBtn"),
    clipboardStatus: document.getElementById("clipboardStatus")
};

let currentRoom = null;
let isRoomHost = false;
const messageView = createMessageView(elements.messages, elements.messageCount);
const clipboard = createClipboardController({
    socket,
    elements,
    getRoom: () => currentRoom,
    onClipboardEntry: messageView.renderHistoryEntry
});
createRoomController({
    socket,
    elements,
    onActivate: activateRoom,
    onReset: resetRoomState
});

elements.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = elements.messageInput.value.trim();
    if (!message || !currentRoom) {
        return;
    }
    socket.emit("test-message", message);
    elements.messageInput.value = "";
});

elements.messages.addEventListener("click", (event) => {
    const syncButton = event.target.closest("[data-history-index]");
    if (!syncButton) {
        return;
    }
    const historyIndex = Number(syncButton.dataset.historyIndex);
    if (Number.isInteger(historyIndex)) {
        socket.emit("clipboard-sync", { historyIndex });
    }
});

socket.on("room-history", (history) => {
    if (currentRoom) {
        messageView.renderHistory(history);
    }
});

socket.on("test-message", (message) => {
    if (typeof message === "string") {
        messageView.addMessage(message);
    }
});

socket.on("room-error", (message) => {
    alert(message);
});

function activateRoom(roomCode, host) {
    currentRoom = roomCode;
    isRoomHost = host;
    elements.roomInput.value = roomCode;
    elements.messageInput.disabled = false;
    elements.sendBtn.disabled = false;
    elements.leaveRoomBtn.disabled = false;
    elements.messageInput.focus();
    clipboard.activate(host);
}

function resetRoomState() {
    currentRoom = null;
    isRoomHost = false;
    elements.messageInput.value = "";
    elements.messageInput.disabled = true;
    elements.sendBtn.disabled = true;
    elements.leaveRoomBtn.disabled = true;
    messageView.reset();
    clipboard.reset();
}
