const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { dbConnection } = require("./database/config");
const { wss } = require("./controllers/websocket/websocket")

// creacion de la app express
const app = express();

// usando el middleware json para poder leer el body de la request
app.use(express.json());

// usando middleware cors para permitir periciones
app.use(cors());

// base de datos
dbConnection();

app.use("/api/auth", require("./routes/AuthRoutes"));

app.use("/api/device", require("./routes/FeederRoutes"));

// Servidor HTTP principal
app.server = app.listen(process.env.PORT, () => {
  console.log("🚀 server up");
});


// permitir upgrade
// Cuando un navegador (o el ESP32) quiere usar WebSocket, primero hace una solicitud HTTP normal, pero con un encabezado especial que dice:
// "Quiero cambiar esta conexión a WebSocket"
// Eso es lo que se llama un upgrade de protocolo.
app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
