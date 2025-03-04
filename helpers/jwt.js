const jwt = require("jsonwebtoken");

const generateJWT = (uid, name) => {
  return new Promise((resolve, reject) => {
    // carga del JWT
    const payload = { uid, name };

    // creando jwt
    // primero la informacion a enviar dentro del jwt
    // luego una plabra secreta
    // configuracion, expira en 2horas en jwt
    // callback despues de generar el token exitosamente o si hubo error
    jwt.sign(
      payload,
      process.env.SECRENT_JWT_SEED,
      {
        expiresIn: "2h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        }

        resolve(token);
      }
    );
  });
};

module.exports = {
  generateJWT,
};
