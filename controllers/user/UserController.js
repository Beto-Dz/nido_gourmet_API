const User =  require('../../models/userModel.js');

const getInfo = (req, res) => {
  const params = req.query;

  console.log(params);

  return resp.json({
    mensaje: "exito",
  });
};

module.exports = {
  getInfo
};
