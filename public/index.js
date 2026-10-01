const socket = io();

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const messages =
    document.getElementById("messages");

sendBtn.addEventListener("click", () => {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    socket.emit("test-message", message);

    messageInput.value = "";
});

socket.on("test-message", (message) => {

    const line = document.createElement("div");

    line.textContent = message;

    messages.appendChild(line);
});