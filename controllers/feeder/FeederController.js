const { response } = require("express");
const feederModel = require("../../models/feederModel");

const createFeeder = async (req, res = response) => {
  try {
    // verificando que el rol del usuario que quiere registrar
    // sea estrictamente administrador
    if (req.rol !== "admin") {
      return res.status(401).json({
        ok: false,
        msg: "No estas autorizado para registrar comederos",
      });
    }

    // Definir el horario por defecto para toda la semana
    const defaultSchedule = {
      startTime: "00:00",
      endTime: "23:00",
    };

    // creando el comedero
    const feeder = new feederModel({
      isActive: true,
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
      user: req.uid,
    });

    await feeder.save();

    return res.status(201).json({
      ok: true,
      msg: "comedero registrado",
      feeder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "ocurrio un error al registrar el comedero",
      error,
    });
  }
};

const activeFeeder = async (req, resp = response) => {
  // desestructurando el id del usuario
  const { idFeeder } = req.body;

  try {
    // obteniendo el comdero de la db
    let feeder = await feederModel.findById(idFeeder);

    if (!feeder) {
      return resp.status(404).json({
        ok: false,
        msg: "No se pudo encontrar el comedero",
      });
    }

    if (feeder.isActive && feeder.user.toString() === req.uid) {
      return res.json({
        ok: true,
        msg: "Ya se encuentra activo el comedero",
        feeder,
      });
    }

    // mutando las propiedades
    feeder.isActive = true;

    if (req.uid) {
      feeder.user = req.uid;
    }

    await feeder.save();

    return resp.json({
      ok: true,
      msg: "se ha activado con éxito el comedero",
      feeder,
    });
  } catch (error) {
    return resp.status(500).json({
      ok: false,
      msg: "ocurrio un error al activar el comedero",
      error,
    });
  }
};

// 📌 PATCH - Actualiza parcialmente el comedero
const partialUpdateFeeder = async (feeder) => {
  const { feederId, ...updateFields } = feeder;

  try {
    let feeder = await feederModel.findById(feederId);

    // // Si el request incluye floodgates, fusionar los datos en lugar de sobrescribir
    if (updateFields.floodgates) {
      Object.keys(updateFields.floodgates).forEach((gate) => {
        if (!feeder.floodgates[gate]) {
          feeder.floodgates[gate] = {};
        }
        Object.assign(feeder.floodgates[gate], updateFields.floodgates[gate]);
      });

      delete updateFields.floodgates; // Evitar sobrescribir todo el objeto
    }

    // Actualizar solo los campos enviados sin sobrescribir el resto
    Object.keys(updateFields).forEach((key) => {
      feeder[key] = updateFields[key];
    });

    await feeder.save();

    return feeder;
  } catch (error) {
    console.log(error);
  }
};

const updateFloodgates = async (feederUpdate) => {
  // desestructurando la informacion recibida
  const { feederId, floodgate, day, startTime, endTime } = feederUpdate;

  try {
    // busqueda en base de datos
    let feeder = await feederModel.findById(feederId);

    // acyualización de la compuerta
    feeder.floodgates[floodgate][day] = { startTime, endTime };

    // guardando
    await feeder.save();

    return feeder;
  } catch (error) {
    console.log(error);
  }
};

const registerVisit = async ({ idFeeder, floodgate_number }) => {
  try {
    // Buscar el feeder por ID
    let feeder = await feederModel.findById(idFeeder);

    // Registrar la visita con la fecha y hora actual
    feeder.floodgates[floodgate_number].visits.push(new Date());

    await feeder.save();

    return feeder;
  } catch (error) {
    console.log(error);
  }
};

const getFeedersByUser = async (req, res) => {
  try {
    const { uid } = req;

    const data = await feederModel.find({ user: uid });

    if (!data) {
      return res.status(404).json({
        ok: false,
        msg: "El usuario no tiene comederos actualmente",
      });
    }

    return res.status(200).json({
      ok: true,
      msg: "Se han obtenido los comederos del cliente exitosamente",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al obtener los comederos del usuario",
      error,
    });
  }
};

const getFeedersByID = async (req, res) => {
  const uid = req.params.id;

  const userId = req.uid;

  try {
    const data = await feederModel.findById(uid);

    if (!data) {
      return res.status(404).json({
        ok: false,
        msg: "No se ha podido encontrar el comedero",
      });
    }

    if (data.user._id != userId) {
      console.log(data.user._id + " = " + userId);
      return res.status(401).json({
        ok: false,
        msg: "No estas autorizado para recuperar la informacion del comedero",
      });
    }

    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al obtener los comederos del usuario",
      error,
    });
  }
};

module.exports = {
  createFeeder,
  activeFeeder,
  // updateFeeder,
  partialUpdateFeeder,
  updateFloodgates,
  registerVisit,
  // getVisits,
  getFeedersByUser,
  getFeedersByID,
};
