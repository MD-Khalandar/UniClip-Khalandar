export function createClipboardController({ socket, elements, getRoom, onClipboardEntry }) {
    const { syncClipboardBtn, autoSyncClipboardBtn, clipboardStatus } = elements;
    let latestClipboard = "";
    let isRoomHost = false;
    let autoSync = false;
    let pollTimer = null;
    let pollInFlight = false;

    syncClipboardBtn.addEventListener("click", async () => {
        if (!getRoom()) {
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
        } else {
            socket.emit("clipboard-sync");
        }
    });

    autoSyncClipboardBtn.addEventListener("click", () => {
        if (!getRoom()) {
            return;
        }
        autoSync = !autoSync;
        autoSyncClipboardBtn.setAttribute("aria-pressed", String(autoSync));
        autoSyncClipboardBtn.textContent = autoSync
            ? (isRoomHost ? "Auto Push On" : "Auto Sync On")
            : (isRoomHost ? "Auto Push" : "Auto Sync");

        if (autoSync && isRoomHost) {
            clipboardStatus.textContent = "Watching clipboard...";
            startPolling();
        } else if (autoSync) {
            clipboardStatus.textContent = "Auto-sync enabled";
            socket.emit("clipboard-sync");
        } else {
            stopPolling();
            clipboardStatus.textContent = isRoomHost ? "Auto-push disabled" : "Auto-sync disabled";
        }
    });

    socket.on("clipboard-pushed", (entry) => {
        latestClipboard = entry.text;
        onClipboardEntry(entry);
        if (!isRoomHost) {
            if (autoSync) {
                syncToDevice(entry.text);
            } else {
                clipboardStatus.textContent = "Clipboard ready to sync";
            }
        }
    });

    socket.on("sync-clipboard", (clipboardData) => syncToDevice(clipboardData));

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.key.toLowerCase() === "s" && !syncClipboardBtn.disabled) {
            event.preventDefault();
            syncClipboardBtn.click();
        }
    });

    function startPolling() {
        stopPolling();
        pollClipboardAndPush();
        pollTimer = setInterval(pollClipboardAndPush, 1000);
    }

    function stopPolling() {
        if (pollTimer !== null) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    async function pollClipboardAndPush() {
        if (!getRoom() || !isRoomHost || !autoSync || pollInFlight) {
            return;
        }
        pollInFlight = true;
        try {
            const clipboardData = await navigator.clipboard.readText();
            if (clipboardData !== latestClipboard) {
                latestClipboard = clipboardData;
                socket.emit("clipboard-push", clipboardData);
                clipboardStatus.textContent = "Clipboard pushed automatically";
            }
        } catch {
            clipboardStatus.textContent = "Clipboard permission was denied";
        } finally {
            pollInFlight = false;
        }
    }

    async function syncToDevice(clipboardData) {
        if (typeof clipboardData !== "string") {
            return;
        }
        latestClipboard = clipboardData;
        try {
            await navigator.clipboard.writeText(clipboardData);
            clipboardStatus.textContent = autoSync ? "Clipboard synced automatically" : "Clipboard synced";
        } catch {
            clipboardStatus.textContent = "Clipboard permission was denied";
        }
    }

    function activate(host) {
        stopPolling();
        isRoomHost = host;
        autoSync = false;
        syncClipboardBtn.disabled = false;
        autoSyncClipboardBtn.disabled = false;
        syncClipboardBtn.textContent = host ? "Push Clipboard" : "Sync Clipboard";
        autoSyncClipboardBtn.textContent = host ? "Auto Push" : "Auto Sync";
        autoSyncClipboardBtn.setAttribute("aria-pressed", "false");
        clipboardStatus.textContent = host ? "Alt+S to push" : "Alt+S to sync";
    }

    function reset() {
        stopPolling();
        isRoomHost = false;
        autoSync = false;
        syncClipboardBtn.disabled = true;
        autoSyncClipboardBtn.disabled = true;
        syncClipboardBtn.textContent = "Sync Clipboard";
        autoSyncClipboardBtn.textContent = "Auto Sync";
        autoSyncClipboardBtn.setAttribute("aria-pressed", "false");
        clipboardStatus.textContent = "";
    }

    return { activate, reset };
}
