const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/image");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "" + Math.round(Math.random() * 10000000000) + "." + file.mimetype.split("/")[1]);
  }
});

module.exports = multer({ storage });
