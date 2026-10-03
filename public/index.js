const socket = io();
let currentRoom = null;
const roomForm = document.getElementById("roomForm");
const createRoomForm = document.getElementById("createRoomForm");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const roomInput = document.getElementById("roomInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const emptyState = document.getElementById("emptyState");
const roomStatus = document.getElementById("roomStatus");
const messageCount = document.getElementById("messageCount");
let totalMessages = 0;
const syncClipboardBtn = document.getElementById("syncClipboardBtn");
const clipboardStatus = document.getElementById("clipboardStatus");
let latestClipboard = "";
let isRoomHost = false;

roomForm.addEventListener("submit", (event) => {
    event.preventDefault();
     const roomCode = roomInput.value.trim().toUpperCase();

    if (!roomCode) {
        roomInput.focus();
        return;
    }

    socket.emit("join-room", roomCode);
    
});
socket.on("room-joined",(roomCode)=>{
    activateRoom(roomCode, false);
})

createRoomForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("create-room");
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message || !currentRoom) {
        return;
    }

    socket.emit("test-message", message);
    
    messageInput.value = "";
});

socket.on("test-message", (message) => {
        if (message && typeof message === "object" && message.type === "clipboard") {
            latestClipboard = message.text;
            if (!isRoomHost) {
                clipboardStatus.textContent = "Clipboard ready to sync";
            }
            return;
        }

        emptyState?.remove();
        const line = document.createElement("div");
        line.className = "message";
        line.textContent = message;
        messages.appendChild(line);
        totalMessages += 1;
        messageCount.textContent = `${totalMessages} ${totalMessages === 1 ? "note" : "notes"}`;
        messages.scrollTop = messages.scrollHeight;
});
socket.on("room-created",(roomCode)=>{
    activateRoom(roomCode, true);
    roomInput.value=roomCode;
});

socket.on("room-error", (message) => {
    alert(message);
});

syncClipboardBtn.addEventListener("click", async () => {
    if (!currentRoom) {
        return;
    }

    if (isRoomHost) {
        try {
            latestClipboard = await navigator.clipboard.readText();
            socket.emit("test-message", { type: "clipboard", text: latestClipboard });
            clipboardStatus.textContent = "Clipboard pushed to the room";
        } catch {
            clipboardStatus.textContent = "Clipboard permission was denied";
        }
        return;
    }

    if (!latestClipboard) {
        clipboardStatus.textContent = "Nothing to sync yet";
        return;
    }

    try {
        await navigator.clipboard.writeText(latestClipboard);
        clipboardStatus.textContent = "Clipboard synced";
    } catch {
        clipboardStatus.textContent = "Clipboard permission was denied";
    }
});

document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key.toLowerCase() === "s" && !syncClipboardBtn.disabled) {
        event.preventDefault();
        syncClipboardBtn.click();
    }
});

function activateRoom(roomCode, host) {
    currentRoom = roomCode;
    isRoomHost = host;
    roomStatus.textContent = `Connected to ${roomCode}`;
    roomStatus.classList.add("is-active");
    messageInput.disabled = false;
    sendBtn.disabled = false;
    syncClipboardBtn.disabled = false;
    syncClipboardBtn.textContent = host ? "Push Clipboard" : "Sync Clipboard";
    clipboardStatus.textContent = host ? "Alt+S to push" : "Alt+S to sync";
    messageInput.focus();
}