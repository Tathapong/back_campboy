const AppError = require("../utilities/appError");
const jwt = require("jsonwebtoken");
const db = require("../models/index");

module.exports = async function (req, res, next) {
  try {
    const { authorization } = req.headers;

    // Validate
    //* if no have req.header or no start with Bearer
    if (!authorization || !authorization.startsWith("Bearer")) throw new AppError("unauthenticated", 401);

    //* If no have token on req.header
    const token = authorization.split(" ")[1];
    if (!token) throw new AppError("unauthenticated", 401);

    // Decode for payload
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || "private_key");
    const user = await db.User.findOne({
      where: { id: payload.id },
      attributes: { exclude: ["password", "email", "createdAt", "updatedAt"] }
    });

    // In case of no have the user
    if (!user) throw new AppError("unauthenticated", 401);

    req.user = user;
    next();
  } catch (err) {
    // In case or expire of token the payload will return error. this code detect the error and define 401
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") err.statusCode = 401;
    next(err);
  }
};
