const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { dbConnection } = require("./database/config");

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

app.listen(process.env.PORT, () => {
  console.log("server up");
});
