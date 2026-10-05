const socket = io();
let currentRoom = null;
const roomForm = document.getElementById("roomForm");
const createRoomForm = document.getElementById("createRoomForm");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const roomInput = document.getElementById("roomInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const roomStatus = document.getElementById("roomStatus");
const messageCount = document.getElementById("messageCount");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
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

    socket.emit("join-room", ({roomCode,socketId: socket.id}));
    
});
socket.on("room-joined",({roomCode,isHost})=>{
    activateRoom(roomCode, isHost);

})

socket.on("room-history", (history) => {
    if (!currentRoom) {
        return;
    }

    messages.innerHTML = "";
    totalMessages = 0;
    history.forEach((entry) => {
        renderHistoryEntry(entry);
        if (entry.type === "message") {
            totalMessages += 1;
        }
    });
    updateMessageCount();
});

createRoomForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("create-room");
});

leaveRoomBtn.addEventListener("click", () => {
    if (!currentRoom) {
        return;
    }

    socket.emit("leave-room");
    resetRoomState();
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
    if (typeof message !== "string") {
        return;
    }

    renderHistoryEntry({ type: "message", text: message });
    totalMessages += 1;
    updateMessageCount();
});

socket.on("clipboard-pushed", (entry) => {
    latestClipboard = entry.text;
    renderHistoryEntry(entry);
    if (!isRoomHost) {
        clipboardStatus.textContent = "Clipboard ready to sync";
    }
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
            socket.emit("clipboard-push", latestClipboard);
            clipboardStatus.textContent = "Clipboard pushed to the room";
        } catch {
            clipboardStatus.textContent = "Clipboard permission was denied";
        }
        return;
    }

    if (!latestClipboard) {
        clipboardStatus.textContent = "Nothing to sync yet";
        return;
    }else{
        socket.emit("clipboard-sync");
    }
});

messages.addEventListener("click", async (event) => {
    const syncButton = event.target.closest("[data-history-index]");
    if (!syncButton) {
        return;
    }

    const historyIndex = Number(syncButton.dataset.historyIndex);
    if (!Number.isInteger(historyIndex)) {
        return;
    }

    socket.emit("clipboard-sync", { historyIndex });
});

socket.on("sync-clipboard", async (clipboardData) => {
    latestClipboard = clipboardData;
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
    leaveRoomBtn.disabled = false;
    syncClipboardBtn.textContent = host ? "Push Clipboard" : "Sync Clipboard";
    clipboardStatus.textContent = host ? "Alt+S to push" : "Alt+S to sync";
    messageInput.focus();
}

function renderHistoryEntry(entry) {
    document.getElementById("emptyState")?.remove();

    if (entry.type === "clipboard") {
        const line = document.createElement("div");
        line.className = "message clipboard-entry";

        const label = document.createElement("span");
        label.className = "clipboard-entry-label";
        label.textContent = "Clipboard push";

        const text = document.createElement("span");
        text.className = "clipboard-entry-text";
        text.textContent = entry.text;

        const syncButton = document.createElement("button");
        syncButton.type = "button";
        syncButton.className = "history-sync-button";
        syncButton.textContent = "Sync";
        syncButton.dataset.historyIndex = String(entry.historyIndex);
        syncButton.title = "Copy this clipboard push to your clipboard";

        line.append(label, text, syncButton);
        messages.appendChild(line);
    } else if (entry.type === "message") {
        const line = document.createElement("div");
        line.className = "message";
        line.textContent = entry.text;
        messages.appendChild(line);
    }

    messages.scrollTop = messages.scrollHeight;
}

function updateMessageCount() {
    messageCount.textContent = `${totalMessages} ${totalMessages === 1 ? "note" : "notes"}`;
}

function resetRoomState() {
    currentRoom = null;
    isRoomHost = false;
    totalMessages = 0;
    roomStatus.textContent = "No room selected";
    roomStatus.classList.remove("is-active");
    messageInput.value = "";
    messageInput.disabled = true;
    sendBtn.disabled = true;
    syncClipboardBtn.disabled = true;
    leaveRoomBtn.disabled = true;
    syncClipboardBtn.textContent = "Sync Clipboard";
    clipboardStatus.textContent = "";
    messageCount.textContent = "0 notes";
    messages.innerHTML = `<div id="emptyState" class="empty-state">
        <span class="empty-icon" aria-hidden="true">+</span>
        <p>Your shared space is ready.</p>
        <span>Join a room to start sending notes.</span>
    </div>`;
}