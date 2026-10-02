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

roomForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const roomCode= roomInput.value.trim();

    if (!roomCode) {
        roomInput.focus();
        return;
    }

    socket.emit("join-room", roomCode);
    currentRoom=roomCode;
    roomStatus.textContent = `Connected to ${roomCode}`;
    roomStatus.classList.add("is-active");
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
});

createRoomForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const roomCode = `room-${Math.random().toString(36).slice(2, 8)}`;
    roomInput.value = roomCode;
    roomForm.requestSubmit();
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message || !currentRoom) {
        return;
    }

    socket.emit("test-message", {roomCode: currentRoom,message: message});
    
    messageInput.value = "";
});

socket.on("test-message", (message) => {
        emptyState?.remove();
        const line = document.createElement("div");
        line.className = "message";
        line.textContent = message;
        messages.appendChild(line);
        totalMessages += 1;
        messageCount.textContent = `${totalMessages} ${totalMessages === 1 ? "note" : "notes"}`;
        messages.scrollTop = messages.scrollHeight;
});