const express = require("express");
const router = express();

const authenticate = require("../middlewares/authenticate");
const blogController = require("../controllers/blogController");
const upload = require("../middlewares/upload");

router.route("/").get(blogController.getAllBlog);
router.route("/:blogId").get(blogController.getBlogById);

router.route("/create/image-upload").post(authenticate, upload.single("imageBlog"), blogController.uploadBlogImage);
router.route("/create/post").post(authenticate, blogController.createBlog);
module.exports = router;
