const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

router.route("/get-random-camp").get(homeController.randomCamp);
router.route("/get-top-camp").get(homeController.getTopCamp);
router.route("/get-more-post").get(homeController.getMorePost);
router.route("/get-recent-review").get(homeController.getRecentReview);

module.exports = router;
