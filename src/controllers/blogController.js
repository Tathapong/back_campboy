const cloudinary = require("../utilities/cloudinary");
const { isNotEmpty } = require("../validation/validation");

const db = require("../models/index");
const AppError = require("../utilities/appError");
const deleteCacheImage = require("../utilities/deleteCacheImage");
const { getAllId } = require("../utilities/getAllModelId");

async function deleteCloudinaryImage(rawContentState) {
  try {
    const entityMap = rawContentState.entityMap;
    for (let key in entityMap) {
      if (entityMap[key].data.public_id) {
        const public_id = `${process.env.CLOUDINARY_BLOG_FOLDER.slice(1)}/${cloudinary.getPublicId(
          entityMap[key].data.public_id
        )}`;
        await cloudinary.deleteResource(public_id);
      }
    }
  } catch (error) {
    throw error;
  }
}

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

    const public_id = await cloudinary.uploadImage(file, cloudinary_folder, undefined);
    return res.status(200).json({ public_id });
  } catch (error) {
    next(error);
  } finally {
    const imageFile = req.file;
    deleteCacheImage([imageFile]);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, rawContentState, featureImage = null } = req.body;
    const rawContent = JSON.stringify(rawContentState);
    const user = req.user;

    //+ Validation
    //- Title
    if (!isNotEmpty(title)) throw new AppError("Title is required", 400);

    //- Raw Content State
    if (!isNotEmpty(rawContent)) throw new AppError("RawContentState is required", 400);

    const rawContentRegEx = /(?=.*{"blocks":)(?=.*"entityMap")/;
    if (!rawContentRegEx.test(rawContent.trim()))
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

exports.updateBlog = async (req, res, next) => {
  try {
    const { title, rawContentState, featureImage = null } = req.body;
    const rawContent = JSON.stringify(rawContentState);

    const { id: userId } = req.user;
    const params = req.params;
    const blogId = +params.blogId;

    const blogAllIdList = await getAllId(db.BlogPost);

    //+ Validation
    //- Title
    if (!isNotEmpty(title)) throw new AppError("Title is required", 400);

    //- Raw Content State
    if (!isNotEmpty(rawContent)) throw new AppError("RawContentState is required", 400);

    const rawContentRegEx = /(?=.*{"blocks":)(?=.*"entityMap")/;
    if (!rawContentRegEx.test(rawContent.trim()))
      throw new AppError("Raw content state is not in json(content state) format", 400);

    //- Feature Image
    const urlRegEx = /^(http|https):\/\/[^ "]+$/;

    if (featureImage && !urlRegEx.test(featureImage.trim()))
      throw new AppError("Feature image is not in url format", 400);

    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    //- Authorized
    const blogPost = await db.BlogPost.findOne({ where: { id: blogId } });
    if (blogPost.userId !== userId) throw new AppError("No authorize to delete other user's blog", 403);

    await deleteCloudinaryImage(JSON.parse(blogPost.content));
    await blogPost.update({ title, content: rawContent, featureImage });

    return res.status(200).json({ blog: { title, content: rawContent, featureImage } });
  } catch (error) {
    next(error);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;

    const { id: userId } = req.user;

    const blogAllIdList = await getAllId(db.BlogPost);

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

exports.getAllBlog = async (req, res, next) => {
  try {
    const userClassify = req.user;
    const includeOption = [
      {
        model: db.User,
        attributes: { exclude: ["createdAt", "updatedAt", "verify", "coverImage", "password", "email", "id", "about"] }
      },
      {
        model: db.BlogLike,
        attributes: { exclude: ["createdAt", "updatedAt", "blogId"] }
      },
      {
        model: db.BlogComment,
        attributes: ["id"]
      }
    ];

    if (userClassify)
      includeOption.push({
        model: db.BlogSave,
        where: { userId: userClassify.id },
        attributes: { exclude: ["createdAt", "updatedAt", "blogId"] },
        separate: true
      });

    const blogs = await db.BlogPost.findAll({
      attributes: { exclude: ["updatedAt"] },
      include: includeOption
    });
    return res.status(200).json({ blogs });
  } catch (error) {
    next(error);
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;

    const userClassify = req.user;

    const blogAllIdList = await getAllId(db.BlogPost);

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId was out of range", 400);

    const includeOption = [
      {
        model: db.User,
        attributes: { exclude: ["createdAt", "updatedAt", "verify", "coverImage", "password", "email", "id"] }
      },
      {
        model: db.BlogLike,
        attributes: { exclude: ["createdAt", "updatedAt", "blogId"] }
      },
      {
        model: db.BlogComment,
        include: [
          { model: db.CommentLike, attributes: { exclude: ["commentId", "createdAt", "updatedAt"] } },
          {
            model: db.User,
            attributes: { exclude: ["email", "password", "coverImage", "about", "verify", "createdAt", "updatedAt"] }
          }
        ],
        attributes: { exclude: ["updatedAt", "blogId"] }
      }
    ];

    if (userClassify)
      includeOption.push({
        model: db.BlogSave,
        where: userClassify ? { userId: userClassify.id } : {},
        attributes: { exclude: ["createdAt", "updatedAt", "blogId"] },
        separate: true
      });

    const blog = await db.BlogPost.findOne({
      where: { id: blogId },
      attributes: { exclude: ["featureImage", "updatedAt"] },
      include: includeOption,
      order: [[db.BlogComment, "createdAt", "DESC"]]
    });
    return res.status(200).json({ blog });
  } catch (error) {
    next(error);
  }
};
