const { response } = require("express");
// obteniendo la funcion que checkea el resultado de la validaciones
const { validationResult } = require("express-validator");

const validarCampos = (req, res = response, next) => {
  // enviando la request a las reglas de validacion
  const errors = validationResult(req);

  // si el array de errores no esta vacío
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.mapped(),
    });
  }

  // si no hay ningun error llamamos al next (siguiente validacion)
  next();
};


module.exports = {
    validarCampos
}