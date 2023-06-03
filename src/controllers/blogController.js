const { json } = require("sequelize");
const cloudinary = require("../utilities/cloudinary");
const fs = require("fs");
const db = require("../models/index");
const AppError = require("../utilities/appError");

const deleteCacheImage = (imageFile) => {
  if (imageFile) fs.unlinkSync(imageFile.path);
};

exports.uploadBlogImage = async (req, res, next) => {
  try {
    const imageBlog = req.file;
    const cloudinary_folder = "/Campboy/posts";

    const public_id = await cloudinary.uploadImage(imageBlog.path, cloudinary_folder, undefined);
    return res.status(200).json({ public_id });
  } catch (error) {
    next(error);
  } finally {
    const imageFile = req.file;
    deleteCacheImage(imageFile);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, html, featureImage = null } = req.body;
    const user = req.user;

    const blogPost = await db.BlogPost.create({ title, content: html, userId: user.id, featureImage });
    return res.status(201).json({ blogPost: blogPost });
  } catch (error) {
    next(error);
  }
};

exports.getAllBlog = async (req, res, next) => {
  try {
    const blogs = await db.BlogPost.findAll();
    return res.status(200).json({ blogs });
  } catch (error) {
    next(error);
  }
};
exports.getBlogById = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const blog = await db.BlogPost.findOne({
      where: { id: blogId }
    });

    if (!blog) throw new AppError("Internal server error", 500);

    return res.status(200).json({ blog });
  } catch (error) {
    next(error);
  }
};
