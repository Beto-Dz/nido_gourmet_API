const WebSocket = require("ws");
const { simpleValidationJWT } = require("../../helpers/simpleValidationJWT");
const {
  partialUpdateFeeder,
  updateFloodgates,
} = require("../feeder/FeederController");

// Creamos el servidor WebSocket (sin servidor HTTP propio).
const wss = new WebSocket.Server({ noServer: true });

let clients = []; // 🔁 Lista de clientes conectados

// Cuando un cliente se conecta
wss.on("connection", (ws) => {
  let clientId = null;

  console.log(`🟢 Cliente conectado (esperando identificador)`);

  // Cuando se recibe un mensaje de cualquier cliente
  ws.on("message", (messag) => {
    const message = messag.toString();

    const now = new Date();
    const formato = now.toLocaleTimeString("es-MX", { hour12: false });

    console.log("📩:", message, ` at ${formato}`);

    try {
      // parsea el mensaje JSON a un objeto js
      const mensajeFormated = JSON.parse(message);

      switch (mensajeFormated.type) {
        case "esp_connect":
          clientId = mensajeFormated.feederId;
          // Reemplaza si ya había una conexión con ese feederId
          clients = clients.filter((c) => c.id !== clientId);
          clients.push({ id: clientId, socket: ws });
          // console.log(`🔗 Asociado feederId: ${clientId}`);
          break;
        case "user_connect":
          const { ok, uid, name, rol } = simpleValidationJWT(
            mensajeFormated.token
          );

          if (mensajeFormated?.movil) {
            clientId = uid + "_movil";
          } else {
            clientId = uid;
          }
          clientType = "user";
          clients = clients.filter((c) => c.id !== clientId);
          clients.push({ id: clientId, socket: ws });
          console.log(`🧑 Usuario autenticado: ${name} (${rol})`);
          break;
        case "update_status":
          delete mensajeFormated.type;
          partialUpdateFeeder(mensajeFormated).then((feederUpdated) =>
            enviarMensaje(JSON.stringify(feederUpdated), ws)
          );
          break;
        case "open_servo":
        case "close_servo":
        case "open_servos":
        case "close_servos":
          enviarMensaje(message, ws);
          break;
        case "update_floodgate":
          updateFloodgates(mensajeFormated).then((feederUpdated) =>
            enviarMensaje(JSON.stringify(feederUpdated), ws)
          );
          break;
      }
    } catch (error) {}
  });

  // Si un cliente se desconecta
  ws.on("close", () => {
    console.log(`🔌 Cliente desconectado: ${clientId}`);
    clients = clients.filter((c) => c.socket !== ws);
  });
});

const enviarMensaje = (message, ws) => {
  // Reenviar a todos los demás (menos el que lo envió)
  clients.forEach((client) => {
    if (client.socket !== ws && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(message);
    }
  });
};

module.exports = {
  wss,
};
