const moment = require("moment");

const isDate = (value, { req, location, path }) => {
  if (!value) {
    return false;
  }

  // crea una instancia de moment (libreria de fechas)
  // para poder saber si es una fecha
  const fecha = moment(value);

  // retorna su es una fecha valida o no
  return fecha.isValid();
};

module.exports = isDate;
