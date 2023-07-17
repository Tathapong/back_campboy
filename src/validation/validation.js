const validator = require("validator");

exports.isEachNumber = (arr) => arr.reduce((acc, item) => !isNaN(+item) && acc, true);
exports.isEachInRange = (arr, rangeList) => arr.reduce((acc, item) => rangeList.includes(+item) && acc, true);
exports.isNotEmpty = (string) => string && string.trim();
exports.isEmail = (email) => validator.isEmail(email);
exports.isStrongPassword = (password) => validator.isStrongPassword(password);
