const { Op } = require("sequelize");
const db = require("../models/index");

const AppError = require("../utilities/appError");
const deleteCacheImage = require("../utilities/deleteCacheImage");
const getAllAttribute = require("../utilities/getAllAttributes");
const { uploadImage, getPublicId, deleteResource } = require("../utilities/cloudinary");
const { isNotEmpty } = require("../validation/validation");

async function deleteCloudinaryImage(rawContentState) {
  try {
    const entityMap = rawContentState.entityMap;
    for (let key in entityMap) {
      if (entityMap[key].data.public_id) {
        const public_id = `${process.env.CLOUDINARY_BLOG_FOLDER.slice(1)}/${getPublicId(
          entityMap[key].data.public_id
        )}`;
        await deleteResource(public_id);
      }
    }
  } catch (error) {
    throw error;
  }
}

///+ Get all blog
exports.getAllBlog = async (req, res, next) => {
  try {
    const userClassify = req.user;

    const attributesOption = [];
    if (userClassify)
      attributesOption.push(
        [
          db.sequelize.literal(
            `(select count(id) from blog_likes where user_id = ${userClassify.id} and blog_id=BlogPost.id)`
          ),
          "isLike"
        ],
        [
          db.sequelize.literal(
            `(select count(id) from blog_saves where user_id = ${userClassify.id} and blog_id=BlogPost.id)`
          ),
          "isSave"
        ]
      );

    const blogs = await db.BlogPost.findAll({
      attributes: [
        "id",
        "title",
        "content",
        "featureImage",
        "createdAt",
        ["user_id", "profileId"],
        [
          db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id = BlogPost.user_id)"),
          "profileName"
        ],
        [db.sequelize.literal("(select profile_image from users where id = BlogPost.user_id)"), "profileImage"],
        [db.sequelize.literal("(select count(id) from blog_likes where blog_id = BlogPost.id)"), "blogLikeCount"],
        [
          db.sequelize.literal(
            "(select count(blog_comments.id) from blog_comments where blog_comments.blog_id = BlogPost.id)"
          ),
          "blogCommentCount"
        ],
        ...attributesOption
      ]
    });

    return res.status(200).json({ blogs });
  } catch (error) {
    next(error);
  }
};

///+ Get blog by Id
exports.getBlogById = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = params.blogId;

    const userClassify = req.user;

    const blogAllIdList = await getAllAttribute(db.BlogPost, "id");

    //+Validation
    //- BlogID

    if (blogId && isNaN(blogId)) throw new AppError("BlogId must be numeric", 404);
    if (!blogAllIdList.includes(+blogId)) throw new AppError("BlogId not found", 404);

    const attributesOption = [];
    const includeOption = [];

    if (userClassify) {
      attributesOption.push(
        [
          db.sequelize.literal(
            `(select count(id) from blog_likes where user_id = ${userClassify.id} and blog_id=BlogPost.id)`
          ),
          "isLike"
        ],
        [
          db.sequelize.literal(
            `(select count(id) from blog_saves where user_id = ${userClassify.id} and blog_id=BlogPost.id)`
          ),
          "isSave"
        ]
      );

      includeOption.push([
        db.sequelize.literal(
          `(select count(id) from comment_likes where user_id = ${userClassify.id} and comment_id=BlogComments.id)`
        ),
        "isCommentLike"
      ]);
    }

    const blog = await db.BlogPost.findOne({
      where: { id: blogId },
      attributes: [
        "id",
        "title",
        "content",
        "featureImage",
        "createdAt",
        ["user_id", "profileId"],
        [
          db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id = BlogPost.user_id)"),
          "profileName"
        ],
        [db.sequelize.literal("(select profile_image from users where id = BlogPost.user_id)"), "profileImage"],
        [db.sequelize.literal("(select about from users where id = BlogPost.user_id)"), "profileAbout"],

        [db.sequelize.literal("(select count(id) from blog_likes where blog_id = BlogPost.id)"), "blogLikeCount"],
        [
          db.sequelize.literal(
            "(select count(blog_comments.id) from blog_comments where blog_comments.blog_id = BlogPost.id)"
          ),
          "blogCommentCount"
        ],
        ...attributesOption
      ],
      include: [
        {
          model: db.BlogComment,
          attributes: [
            "id",
            "contentText",
            "createdAt",
            ["user_id", "profileId"],
            [
              db.sequelize.literal(
                "(select concat(first_name,' ',last_name) from users where id = BlogComments.user_id)"
              ),
              "profileName"
            ],
            [db.sequelize.literal("(select profile_image from users where id = BlogComments.user_id)"), "profileImage"],
            [
              db.sequelize.literal("(select count(id) from comment_likes where comment_id=BlogComments.id)"),
              "commentLikeCount"
            ],
            ...includeOption
          ]
        }
      ],
      order: [[db.sequelize.literal("BlogComments.created_at"), "DESC"]]
    });

    const profileId = JSON.parse(JSON.stringify(blog)).profileId;

    const moreBlog = await db.BlogPost.findAll({
      where: { id: { [Op.ne]: blogId }, userId: profileId },
      attributes: ["id", "title", "featureImage", "createdAt"],
      limit: 5,
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({ blog, moreBlog });
  } catch (error) {
    next(error);
  }
};

///+ Upload blog image
exports.uploadBlogImage = async (req, res, next) => {
  try {
    const imageBlog = req.file;
    const { url } = req.body;
    const cloudinary_folder = process.env.CLOUDINARY_BLOG_FOLDER;

    //+ Validation
    //- File
    if (imageBlog && !imageBlog.mimetype.startsWith("image/")) throw new AppError("File type is not image", 400);

    //- URL
    if (url && !url.startsWith("http")) throw new AppError("URL is not url format", 400);

    //- File & URL
    if (!imageBlog && !url) throw new AppError("Image file or url is required", 400);

    let file;

    if (imageBlog) file = imageBlog.path;
    else if (url) file = url;

    const public_id = await uploadImage(file, cloudinary_folder, undefined);
    return res.status(200).json({ public_id });
  } catch (error) {
    next(error);
  } finally {
    const imageFile = req.file;
    if (imageFile) deleteCacheImage([imageFile]);
  }
};

///+ Create blog
exports.createBlog = async (req, res, next) => {
  try {
    const { title, rawContentState, featureImage = null } = req.body;
    const rawContent = JSON.stringify(rawContentState);
    const user = req.user;

    //+ Validation
    //- Title
    if (!isNotEmpty(title)) throw new AppError("Title is required", 400);

    //- Raw Content State
    if (!rawContentState) throw new AppError("RawContentState is required", 400);

    const rawContentRegEx = /(?=.*{"blocks":)(?=.*"entityMap")/;
    if (!rawContentRegEx.test(rawContent))
      throw new AppError("Raw content state is not in json(content state) format", 400);

    //- Feature Image
    const urlRegEx = /^(http|https):\/\/[^ "]+$/;

    if (featureImage && !urlRegEx.test(featureImage.trim()))
      throw new AppError("Feature image is not in url format", 400);

    const blogPost = await db.BlogPost.create({
      title,
      content: rawContent,
      userId: user.id,
      featureImage
    });
    return res.status(201).json({ blogPost: blogPost });
  } catch (error) {
    next(error);
  }
};

///+ Update blog
exports.updateBlog = async (req, res, next) => {
  try {
    const { title, rawContentState, featureImage = null } = req.body;
    const rawContent = JSON.stringify(rawContentState);

    const { id: userId } = req.user;
    const params = req.params;
    const blogId = +params.blogId;

    const blogAllIdList = await getAllAttribute(db.BlogPost, "id");

    //+ Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    //- Title
    if (!isNotEmpty(title)) throw new AppError("Title is required", 400);

    //- Raw Content State
    if (!rawContentState) throw new AppError("RawContentState is required", 400);

    const rawContentRegEx = /(?=.*{"blocks":)(?=.*"entityMap")/;
    if (!rawContentRegEx.test(rawContent.trim()))
      throw new AppError("Raw content state is not in json(content state) format", 400);

    //- Feature Image
    const urlRegEx = /^(http|https):\/\/[^ "]+$/;

    if (featureImage && !urlRegEx.test(featureImage.trim()))
      throw new AppError("Feature image is not in url format", 400);

    //- Authorized
    const blogPost = await db.BlogPost.findOne({ where: { id: blogId } });
    if (blogPost.userId !== userId) throw new AppError("No authorize to update other user's blog", 403);

    await deleteCloudinaryImage(JSON.parse(blogPost.content));
    await blogPost.update({ title, content: rawContent, featureImage });

    return res.status(200).json({ blog: { title, content: rawContent, featureImage } });
  } catch (error) {
    next(error);
  }
};

///+ Delete blog
exports.deleteBlog = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;

    const { id: userId } = req.user;

    const blogAllIdList = await getAllAttribute(db.BlogPost, "id");

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    //- Authorized
    const blogPost = await db.BlogPost.findOne({ where: { id: blogId } });
    if (blogPost.userId !== userId) throw new AppError("No authorize to delete other user's blog", 403);

    const blogSaves = await db.BlogSave.findAll({ where: { blogId } });
    if (blogSaves.length) await db.BlogSave.destroy({ where: { blogId } });

    const blogLikes = await db.BlogLike.findAll({ where: { blogId } });
    if (blogLikes.length) await db.BlogLike.destroy({ where: { blogId } });

    const blogCommentsId = await db.BlogComment.findAll({ where: { blogId }, attributes: ["id"], raw: true });
    const blogCommentsIdList = blogCommentsId.map((item) => item.id);

    if (blogCommentsIdList.length) {
      await db.CommentLike.destroy({ where: { commentId: blogCommentsIdList } });
      await db.BlogComment.destroy({ where: { blogId } });
    }

    await deleteCloudinaryImage(JSON.parse(blogPost.content));
    await blogPost.destroy();

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
