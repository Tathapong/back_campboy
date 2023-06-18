const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const userClassify = require("../middlewares/userClassifyMiddleware");

router.route("/:profileId").get(userClassify, profileController.getProfileById);

module.exports = router;
