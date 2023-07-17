const jwt = require("jsonwebtoken");

module.exports = function genToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY || "private_key", {
    expiresIn: process.env.JWT_EXPIRES || "30d"
  });
};
