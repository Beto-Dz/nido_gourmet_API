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
      isActive: false,
      batteryLevel: 0,
      location: {
        type: "Point",
        coordinates: [-99.1332, 19.4326], // Latitud y Longitud (Ejemplo: CDMX)
      },
      floodgates: {
        1: {
          monday: defaultSchedule,
          tuesday: defaultSchedule,
          wednesday: defaultSchedule,
          thursday: defaultSchedule,
          friday: defaultSchedule,
          saturday: defaultSchedule,
          sunday: defaultSchedule,
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
          visits: [],
        },
        3: {
          monday: defaultSchedule,
          tuesday: defaultSchedule,
          wednesday: defaultSchedule,
          thursday: defaultSchedule,
          friday: defaultSchedule,
          saturday: defaultSchedule,
          sunday: defaultSchedule,
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
    feeder.user = req.uid;

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

// 📌 PUT - Actualiza completamente el comedero
const updateFeeder = async (req, res = response) => {
  const { idFeeder, isActive, batteryLevel, location, floodgates, user } =
    req.body;

  try {
    let feeder = await feederModel.findById(idFeeder);

    if (!feeder) {
      return res.status(404).json({
        ok: false,
        msg: "No se pudo encontrar el comedero",
      });
    }

    if (feeder.user.toString() !== req.uid) {
      return res.status(401).json({
        ok: false,
        msg: `No estas autorizado para actualizar el comedero ${feeder.user.toString()} y ${
          req.uid
        }`,
      });
    }

    feeder.isActive = isActive;
    feeder.batteryLevel = batteryLevel;
    feeder.location = location;
    feeder.floodgates = floodgates;

    await feeder.save();

    return res.json({
      ok: true,
      msg: "Comedero actualizado correctamente",
      feeder,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al actualizar el comedero",
      error,
    });
  }
};

// 📌 PATCH - Actualiza parcialmente el comedero
const partialUpdateFeeder = async (req, res = response) => {
  const { idFeeder, ...updateFields } = req.body;

  try {
    let feeder = await feederModel.findById(idFeeder);

    if (!feeder) {
      return res.status(404).json({
        ok: false,
        msg: "No se pudo encontrar el comedero",
      });
    }

    if (feeder.user.toString() !== req.uid || req.rol !== "admin") {
      return res.status(401).json({
        ok: false,
        msg: `No estas autorizado para actualizar el comedero ${feeder.user.toString()} y ${
          req.uid
        }`,
      });
    }

    // Si el request incluye floodgates, fusionar los datos en lugar de sobrescribir
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

    return res.json({
      ok: true,
      msg: "Comedero actualizado parcialmente",
      feeder,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al actualizar parcialmente el comedero",
      error,
    });
  }
};

const registerVisit = async (req, res = response) => {
  const { idFeeder, floodgate } = req.body;

  try {
    // Buscar el feeder por ID
    let feeder = await feederModel.findById(idFeeder);

    if (!feeder) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el comedero",
      });
    }

    if (feeder.user.toString() !== req.uid || req.rol !== "admin") {
      return res.status(401).json({
        ok: false,
        msg: `No estas autorizado para actualizar el comedero ${feeder.user.toString()} y ${
          req.uid
        }`,
      });
    }

    // Verificar si la compuerta existe en el feeder
    if (!feeder.floodgates[floodgate]) {
      return res.status(400).json({
        ok: false,
        msg: `La compuerta ${floodgate} no existe en este comedero`,
      });
    }

    // Registrar la visita con la fecha y hora actual
    feeder.floodgates[floodgate].visits.push(new Date());

    await feeder.save();

    return res.json({
      ok: true,
      msg: `Visita registrada en la compuerta ${floodgate}`,
      feeder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al registrar la visita",
      error,
    });
  }
};

const getVisits = async (req, res = response) => {
  const { idFeeder, floodgate } = req.query;

  try {
    // Buscar el feeder por ID
    let feeder = await feederModel.findById(idFeeder);

    if (!feeder) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el comedero",
      });
    }

    // Si se especifica una compuerta, devolver solo sus visitas
    if (floodgate) {
      if (!feeder.floodgates[floodgate]) {
        return res.status(400).json({
          ok: false,
          msg: `La compuerta ${floodgate} no existe en este comedero`,
        });
      }

      return res.json({
        ok: true,
        msg: `Visitas registradas en la compuerta ${floodgate}`,
        visits: feeder.floodgates[floodgate].visits,
      });
    }

    // Si no se especifica una compuerta, devolver todas las visitas por compuerta
    const allVisits = {
      "1": feeder.floodgates["1"].visits,
      "2": feeder.floodgates["2"].visits,
      "3": feeder.floodgates["3"].visits,
    };

    return res.json({
      ok: true,
      msg: "Visitas registradas en todas las compuertas",
      visits: allVisits,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al obtener las visitas",
      error,
    });
  }
};


module.exports = {
  createFeeder,
  activeFeeder,
  updateFeeder,
  partialUpdateFeeder,
  registerVisit,
  getVisits
};
