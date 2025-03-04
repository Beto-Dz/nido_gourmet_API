const mongoose = require("mongoose");
require("dotenv").config();

// coneccion a base de datos
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN);
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
    throw new Error("Error al conecta con base de datos");
  }
};

module.exports = {
  dbConnection,
};
