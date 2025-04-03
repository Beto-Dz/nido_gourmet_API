const { Router } = require("express");
const { check } = require("express-validator");
const { createFeeder, activeFeeder, updateFeeder, partialUpdateFeeder, registerVisit, getVisits } = require("../controllers/feeder/FeederController");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

// aplica el middleware de validar token para todas las rutas
router.use(validarJWT);

// endpoint para registrar un nuevo comedero
router.post("/new", [], createFeeder);

// endpoint para activar un comedero
router.patch(
  "/active",
  [
    check("idFeeder", "el id del comedero debe ser mayor a 12 caracteres")
      .notEmpty()
      .isLength({ min: 12 }),
    validarCampos,
  ],
  activeFeeder
);

// Endpoint para actualizar completamente un comedero (PUT)
router.put(
  "/",
  [
    check("idFeeder", "El ID del comedero es obligatorio").notEmpty(),
    validarCampos,
  ],
  updateFeeder
);

// Endpoint para actualización parcial de un comedero (PATCH)
router.patch(
  "/",
  [
    check("idFeeder", "El ID del comedero es obligatorio").notEmpty(),
    validarCampos,
  ],
  partialUpdateFeeder
);

// endpoint para registrar una visita en una compuerta del feeder
router.post(
  "/visit",
  [
    check("idFeeder", "El ID del comedero es obligatorio y debe tener al menos 12 caracteres")
      .notEmpty()
      .isLength({ min: 12 }),
    check("floodgate", "Debes especificar la compuerta (1 | 2)")
      .notEmpty()
      .isIn(["1", "2"]),
    validarCampos,
  ],
  registerVisit
);

// Endpoint para obtener las visitas de un comedero y una compuerta específica
router.get(
  "/visit",
  [
    check("idFeeder", "El ID del comedero es obligatorio y debe tener al menos 12 caracteres")
      .notEmpty()
      .isLength({ min: 12 }),
    check("floodgate", "La compuerta debe ser 1, 2 o 3")
      .optional()
      .isIn(["1", "2", "3"]),
    validarCampos,
  ],
  getVisits
);

module.exports = router;
