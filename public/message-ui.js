export function createMessageView(messages, messageCount) {
    let totalMessages = 0;

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

    function renderHistory(history) {
        messages.innerHTML = "";
        totalMessages = 0;
        history.forEach((entry) => {
            renderHistoryEntry(entry);
            if (entry.type === "message") {
                totalMessages += 1;
            }
        });
        updateMessageCount();
    }

    function addMessage(message) {
        renderHistoryEntry({ type: "message", text: message });
        totalMessages += 1;
        updateMessageCount();
    }

    function reset() {
        totalMessages = 0;
        messageCount.textContent = "0 notes";
        messages.innerHTML = `<div id="emptyState" class="empty-state">
            <span class="empty-icon" aria-hidden="true">+</span>
            <p>Your shared space is ready.</p>
            <span>Join a room to start sending notes.</span>
        </div>`;
    }

    function updateMessageCount() {
        messageCount.textContent = `${totalMessages} ${totalMessages === 1 ? "note" : "notes"}`;
    }

    return { addMessage, renderHistory, renderHistoryEntry, reset };
}
