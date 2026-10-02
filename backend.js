const express=require('express');
const app=express();
const http=require('http');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io=new Server(server);
app.use(express.static("public"));
io.on("connection", (socket) => {
    socket.on("join-room",(roomCode)=>{
        socket.join(roomCode);
        console.log(`${socket.id} joined room ${roomCode}`);
    })
    console.log("Client connected:", socket.id);

    socket.on("test-message", ({roomCode, message}) => {
        console.log("Received:", message);
        io.to(roomCode).emit("test-message", message);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
