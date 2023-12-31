const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");

router.route("/").patch(
  authenticate,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  profileController.updateProfileById
);
router.route("/:profileId").get(profileController.getProfileById);
router.route("/:profileId").post(authenticate, profileController.toggleFollow);

router.route("/follow/topWriter").get(profileController.getAccountListTopWriter);

module.exports = router;
