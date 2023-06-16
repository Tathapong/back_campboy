const express = require("express");
const router = express();

const authenticate = require("../middlewares/authenticate");
const blogController = require("../controllers/blogController");
const commentController = require("../controllers/commentController");
const saveLikeController = require("../controllers/saveLikeController");
const userClassifyMiddleWare = require("../middlewares/userClassifyMiddleware");
const upload = require("../middlewares/upload");

router.route("/").get(userClassifyMiddleWare, blogController.getAllBlog);
router.route("/:blogId").get(userClassifyMiddleWare, blogController.getBlogById);
router.route("/:blogId").put(authenticate, blogController.updateBlog);
router.route("/:blogId").delete(authenticate, blogController.deleteBlog);

router.route("/:blogId/save").post(authenticate, saveLikeController.toggleSave);
router.route("/:blogId/like").post(authenticate, saveLikeController.toggleLike);

router.route("/:blogId/comment").post(authenticate, commentController.createComment);
router.route("/:blogId/comment/:commentId").patch(authenticate, commentController.updateComment);
router.route("/:blogId/comment/:commentId").delete(authenticate, commentController.deleteComment);

router.route("/create/image-upload").post(authenticate, upload.single("imageBlog"), blogController.uploadBlogImage);
router.route("/create/post").post(authenticate, blogController.createBlog);
module.exports = router;
