const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const Document = require("./models/Document");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose.connect("mongodb://127.0.0.1:27017/realtimeDB")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("get-document", async (documentId) => {
    const document = await Document.findById(documentId);
    if (document) {
      socket.join(documentId);
      socket.emit("load-document", document.data);
    }
  });

  socket.on("send-changes", (delta) => {
    socket.broadcast.emit("receive-changes", delta);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});