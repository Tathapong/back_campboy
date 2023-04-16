const express = require("express");
const router = express();

const authenticate = require("../middlewares/authenticate");
const campController = require("../controllers/campController");

router.route("/").get(campController.filterAllCamp, campController.getAllCamp);
router.route("/:campId").get(campController.getCampById);
router.route("/review").post(authenticate, campController.writeReview);

module.exports = router;
