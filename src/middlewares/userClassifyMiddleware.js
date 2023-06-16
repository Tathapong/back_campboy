const jwt = require("jsonwebtoken");
const db = require("../models/index");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer")) {
      req.user = null;
      return next();
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || "private_key");
    const existUser = await db.User.findOne({ where: { id: payload.id }, attributes: { exclude: "password" } });

    if (!existUser) {
      req.user = null;
      return next();
    }

    req.user = existUser;
    return next();
  } catch (error) {
    next(error);
  }
};
