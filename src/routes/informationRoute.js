const informationController = require("../controllers/informationController");

const express = require("express");
const router = express.Router();

router.route("/provinces").get(informationController.getProvinces);
router.route("/filtercheckboxs").get(informationController.getFliterCheckbox);
router.route("/properties").get(informationController.getProperties);

module.exports = router;
