const PORT = process.env.PORT || 3000;
const express=require('express');
const app=express();
const http=require('http');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io=new Server(server);
const rooms = new Map();
app.use(express.static("public"));
io.on("connection", (socket) => {
    socket.on("join-room",({roomCode,socketId})=>{
        let isHost = rooms.get(roomCode)?.roomHostId === socket.id;
        const oldRoom = socket.data.roomCode;

            if (oldRoom) {
                socket.leave(oldRoom);
            }

        if(rooms.has(roomCode)){
            socket.join(roomCode);
            socket.data.roomCode = roomCode;
            console.log(`${socket.id} joined room ${roomCode}`)
            const room = rooms.get(roomCode);
            socket.emit("room-joined",{roomCode,isHost});
            socket.emit("room-history", room.history.map((entry, historyIndex) => ({
                ...entry,
                historyIndex
            })));
        }
        else{

            socket.emit("room-error", "room doesnot exist")
        }
       
    })
    console.log("Client connected:", socket.id);

   socket.on("test-message", (message) => {

    const roomCode = socket.data.roomCode;


    if (!roomCode) {
        return;
    }
    const historyEntry = {
        type: "message",
        text: message
    };
    let room = rooms.get(roomCode);
    if (!room) {
        return;
    }
    room.history.push(historyEntry);

    io.to(roomCode).emit(
        "test-message",
        message
    );
});
    socket.on("leave-room", () => {
        const roomCode = socket.data.roomCode;

        if (!roomCode) {
            return;
        }

        socket.leave(roomCode);
        delete socket.data.roomCode;
        console.log(`${socket.id} left room ${roomCode}`);
    });
    socket.on("create-room",()=>{
        const oldRoom = socket.data.roomCode;
        if (oldRoom) {
            socket.leave(oldRoom);
        }
        let roomCode;
        do{
            roomCode=generateRoomCode()
        }while(rooms.has(roomCode))
        rooms.set(roomCode, {
            roomCode,
            roomHostId: socket.id,
            history: []
        })
        socket.join(roomCode)
        socket.data.roomCode=roomCode
        socket.emit("room-created",roomCode)
        console.log(`${socket.id} created ${roomCode}`)


    })

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
    socket.on("clipboard-push", (clipboardData) => {

    const roomCode = socket.data.roomCode;

    if (!roomCode || typeof clipboardData !== "string") {
        return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
        return;
    }

    if (room.roomHostId !== socket.id) {
        return;
    }

    room.history.push({
        type: "clipboard",
        text: clipboardData
    });
    const historyIndex = room.history.length - 1;
    io.to(roomCode).emit("clipboard-pushed", {
        type: "clipboard",
        text: clipboardData,
        historyIndex
    });
});
socket.on("clipboard-sync", ({ historyIndex } = {}) => {
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);
    if (!room) {
        return;
    }
    let clipboardEntry;
    if (Number.isInteger(historyIndex)) {
        clipboardEntry = room.history[historyIndex];
    } else {
        clipboardEntry = room.history
            .filter(entry => entry.type === "clipboard")
            .at(-1);
    }
    const clipboardData = clipboardEntry?.type === "clipboard"
        ? clipboardEntry.text
        : null;

    if (!roomCode || typeof clipboardData !== "string") {
        return;
    }
    socket.emit("sync-clipboard", clipboardData);
})

});
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
function generateRoomCode() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}
