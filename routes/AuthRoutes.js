const { Router } = require("express");

// importacion de check de express validator
// check, checkea que ciertos campos se encuentren en el body de la request
// con ciertas reglas de validacion
const { check } = require("express-validator");

const {
  registerUser,
  login,
  renew,
} = require("../controllers/auth/AuthController");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");

// ejecutamos la funcion Router
const router = Router();

// registro de usuario
router.post(
  "/new",
  [
    // que el name sea obligatorio y no este vacio
    check("name", "El nombre es obligatorio y mayor a 3 caracteres")
      .not()
      .isEmpty()
      .isString()
      .isLength({ min: 3 }),
    check("paternalSurname", "El apellido paterno es obligatorio y mayor a 8 caracteres")
      .not()
      .isEmpty()
      .isString()
      .isLength({ min: 8 }),
    check("maternalSurname", "El apellido materno es obligatorio y mayor a 8 caracteres")
      .not()
      .isEmpty()
      .isString()
      .isLength({ min: 8 }),
    check("phone", "El numero telefonico es obligatorio y mayor a 8 caracteres")
      .not()
      .isEmpty()
      .isString()
      .isLength({ min: 10 }),
    check("email", "El correo es olbigatorio y mayor a 10 caracteres").isEmail().isLength({ min: 10 }),
    check("password", "La contrasena es obligatoria y mayor a 5 caracteres").isLength({ min: 5 }),
    validarCampos,
  ],
  registerUser
);

// login
router.post(
  "/",
  [
    check("email", "El correo es olbigatorio").isEmail().isLength({ min: 10 }),
    check("password", "La contrasena es obligatoria").isLength({ min: 5 }),
    validarCampos,
  ],
  login
);

// renovar token
router.get("/renew", validarJWT, renew);

module.exports = router;
