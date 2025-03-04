const { response } = require("express");
const jwt = require("jsonwebtoken");

const validarJWT = (req, resp = response, next) => {
  //leyendo x-token en lo headers (x- sirve para crear un header personalizado)
  const token = req.header("x-token");

  // si el token no exite (no fue enviado)
  if (!token) {
    return resp.status(401).json({
      ok: false,
      msg: "No hay token en la peticion, por lo tanto no esta autorizado",
    });
  }

  try {
    // obteniendo las propiedades del payload de jwt. primero verifica que sea un token valido
    // si es asi obtiene el payload desestructuramos el uid y name
    const { uid, name } = jwt.verify(token, process.env.SECRENT_JWT_SEED);

    // modificando la request para andjuntarle el id y el name del usuario que hizo la request
    req.uid = uid;
    req.name = name;
  } catch (error) {
    return resp.status(401).json({
      ok: false,
      mdg: "token no válido",
    });
  }

  next();
};

module.exports = {
  validarJWT,
};
