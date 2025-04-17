const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const feederModel = require("../models/feederModel");
const userModel = require("../models/userModel");

// coneccion a base de datos
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN);
    console.log("DB Connected");

    try {
      // encriptar password
      const salt = bcrypt.genSaltSync();
      const password = bcrypt.hashSync("betodelac@gmail.com", salt);

      const userId = new mongoose.Types.ObjectId("67f5771b429380cae76be741");
      const feederId = new mongoose.Types.ObjectId("67f57821c597ab31781c074d");

      const user = new userModel({
        _id: userId,
        name: "humberto",
        paternalSurname: "de la cruz",
        maternalSurname: "dominguez",
        phone: "2312313212",
        email: "betodelac@gmail.com",
        password,
        rol: "admin",
      });

      await user.save();

      // Definir el horario por defecto para toda la semana
      const defaultSchedule = {
        startTime: "00:00",
        endTime: "23:00",
      };

      const feeder = new feederModel({
        _id: feederId,
        isActive: false,
        batteryLevel: 0,
        floodgates: {
          1: {
            monday: defaultSchedule,
            tuesday: defaultSchedule,
            wednesday: defaultSchedule,
            thursday: defaultSchedule,
            friday: defaultSchedule,
            saturday: defaultSchedule,
            sunday: defaultSchedule,
            foodLevel: 0,
            visits: [],
          },
          2: {
            monday: defaultSchedule,
            tuesday: defaultSchedule,
            wednesday: defaultSchedule,
            thursday: defaultSchedule,
            friday: defaultSchedule,
            saturday: defaultSchedule,
            sunday: defaultSchedule,
            foodLevel: 0,
            visits: [],
          },
        },
        user: userId,
      });

      await feeder.save();
    } catch (error) {
      console.log("Usuario admin registrado");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error al conectar con base de datos");
  }
};

module.exports = {
  dbConnection,
};
