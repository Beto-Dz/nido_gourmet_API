// ayuda para obtener el intellipsens
const { response } = require("express");
const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../../helpers/jwt");

// funcion para registrar un usuario
const registerUser = async (req, res = response) => {
  // desestructurando el body de request
  const { email, password } = req.body;

  try {
    // buscamos un usuario con el mismo correo
    let usuario = await User.findOne({ email });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un usuario con ese correo electronico",
      });
    }

    // creando nuevo usuario
    usuario = new User(req.body);

    // encriptar password
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    // grabando en base de datos
    await usuario.save();

    // generar JWT
    const token = await generateJWT(usuario.id, usuario.name);

    return res.status(201).json({
      ok: true,
      msg: "register",
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "comuniquese con su administrador",
    });
  }
};

// funcion para logear un usuario
const login = async (req, res = response) => {
  // desestructurando el body de request
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Email no registrado",
      });
    }

    // booleano  si la password es la que esta almacenada
    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res.status(500).json({
        ok: false,
        msg: "contraseña incorrecta",
      });
    }

    // generar JWT
    const token = await generateJWT(usuario.id, usuario.name);

    return res.json({
      ok: true,
      msg: "login",
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "comuniquese con su administrador",
    });
  }
};

// funcion para renovar el token de un usuario
const renew = async (req, res = response) => {
  // obteniendo el id y name de la request odificada por e middleware
  const { uid, name } = req;

  try {
    // generando un nuevo token
    const token = await generateJWT(uid, name);

    return res.json({
      ok: true,
      msg: "renew token",
      uid,
      name,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "comuniquese con su administrador",
    });
  }
};

module.exports = {
  registerUser,
  login,
  renew,
};
