export function createRoomController({ socket, elements, onActivate, onReset }) {
    const { roomForm, createRoomForm, roomInput, roomShare, roomLinkInput, copyRoomLinkBtn,
        roomStatus, leaveRoomBtn } = elements;
    const roomFromUrl = new URLSearchParams(window.location.search).get("room");
    let currentRoom = null;

    if (roomFromUrl) {
        roomInput.value = roomFromUrl.trim().toUpperCase();
    }

    roomForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const roomCode = roomInput.value.trim().toUpperCase();
        if (!roomCode) {
            roomInput.focus();
            return;
        }
        socket.emit("join-room", { roomCode, socketId: socket.id });
    });

    socket.on("connect", () => {
        if (roomFromUrl && !currentRoom) {
            socket.emit("join-room", { roomCode: roomFromUrl, socketId: socket.id });
        }
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
        reset();
    });

    copyRoomLinkBtn.addEventListener("click", async () => {
        if (!roomLinkInput.value) {
            return;
        }
        try {
            await navigator.clipboard.writeText(roomLinkInput.value);
            roomStatus.textContent = "Room link copied";
        } catch {
            roomLinkInput.select();
            roomStatus.textContent = "Copy the selected room link";
        }
    });

    socket.on("room-joined", ({ roomCode, isHost }) => activate(roomCode, isHost));
    socket.on("room-created", (roomCode) => {
        activate(roomCode, true);
        roomInput.value = roomCode;
    });

    function activate(roomCode, isHost) {
        currentRoom = roomCode;
        const roomLink = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;
        roomStatus.textContent = `Connected to ${roomCode}`;
        roomStatus.classList.add("is-active");
        roomLinkInput.value = roomLink;
        roomShare.hidden = false;
        window.history.replaceState(null, "", `?room=${encodeURIComponent(roomCode)}`);
        onActivate(roomCode, isHost);
    }

    function reset() {
        currentRoom = null;
        roomStatus.textContent = "No room selected";
        roomStatus.classList.remove("is-active");
        roomShare.hidden = true;
        roomLinkInput.value = "";
        window.history.replaceState(null, "", window.location.pathname);
        onReset();
    }

    return {
        getCurrentRoom: () => currentRoom
    };
}
