const express=require('express');
const app=express();
const http=require('http');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io=new Server(server);
const rooms = new Set();
app.use(express.static("public"));
io.on("connection", (socket) => {
    socket.on("join-room",(roomCode)=>{
        if(rooms.has(roomCode)){
            socket.join(roomCode);
            socket.data.roomCode = roomCode;
            console.log(`${socket.id} joined room ${roomCode}`)
            socket.emit("room-joined",roomCode)
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

    io.to(roomCode).emit(
        "test-message",
        message
    );
});
    socket.on("create-room",()=>{
        let roomCode;
        do{
            roomCode=generateRoomCode()
        }while(rooms.has(roomCode))
        rooms.add(roomCode)
        socket.join(roomCode)
        socket.data.roomCode=roomCode
        socket.emit("room-created",roomCode)
        console.log(`${socket.id} created ${roomCode}`)


    })

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
function generateRoomCode() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}
