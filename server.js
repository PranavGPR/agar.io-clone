const express = require("express");
const app = express();
const socketio = require("socket.io");
const helmet = require("helmet");

app.use(express.static(__dirname + "/public"));
app.use(helmet());

const PORT = 5000;

const expressServer = app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});

const io = socketio(expressServer);

module.exports = { app, io };
