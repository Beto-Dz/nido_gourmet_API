const jwt = require("jsonwebtoken");

const simpleValidationJWT = (token = "") => {
  try {
    const { uid, name, rol } = jwt.verify(token, process.env.SECRENT_JWT_SEED);
    return { ok: true, uid, name, rol };
  } catch (error) {
    return { ok: false, msg: "Token no válido" };
  }
};

module.exports = {
  simpleValidationJWT,
};
