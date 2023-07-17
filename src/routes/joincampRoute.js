const express = require("express");
const joincampController = require("../controllers/joincampController");
const router = express.Router();

router.route("/").post(joincampController.createJoincamp);

module.exports = router;
