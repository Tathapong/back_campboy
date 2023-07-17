const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authenticate");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/getme").get(authenticate, authController.getMe);
router.route("/change-password").patch(authenticate, authController.changePassword);

router.route("/send-email").post(authController.sendEmail);
router.route("/users/:userId/verify/:hashedToken").get(authController.verifyEmail);

router
  .route("/users/:userId/reset-password/:hashedToken")
  .get(authController.verifyLink)
  .post(authController.resetPassword);

module.exports = router;
