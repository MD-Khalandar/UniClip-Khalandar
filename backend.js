const express=require('express');
const app=express();
const http=require('http');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io=new Server(server);
app.use(express.static("public"));
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("test-message", (message) => {
        console.log("Received:", message);
        io.emit("test-message", message);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
