const express = require("express");
const router = express.Router();

const commentController = require("../controllers/commentController");
const authenticate = require("../middlewares/authenticate");

router.route("/:commentId").post(authenticate, commentController.toggleCommentLike);

module.exports = router;
