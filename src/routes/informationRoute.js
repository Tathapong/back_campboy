const informationController = require("../controllers/informationController");

const express = require("express");
const router = express.Router();

router.route("/provinces").get(informationController.getProvinces);
router.route("/filtercheckboxs").get(informationController.getFliterCheckbox);

module.exports = router;
