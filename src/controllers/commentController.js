const db = require("../models/index");
const AppError = require("../utilities/appError");

const getAllAttributes = require("../utilities/getAllAttributes");
const { isNotEmpty } = require("../validation/validation");

///+ Create comment
exports.createComment = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;

    const { id: userId } = req.user;
    const { title } = req.body;

    const blogAllIdList = await getAllAttributes(db.BlogPost, "id");

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    //- Title
    if (!isNotEmpty(title)) throw new AppError("Comment is required", 400);

    const comment = await db.BlogComment.create({ userId, blogId, contentText: title });
    const result = await db.BlogComment.findOne({
      where: { id: comment.id },
      attributes: [
        "id",
        "contentText",
        "createdAt",
        ["user_id", "profileId"],
        [
          db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id = BlogComment.user_id)"),
          "profileName"
        ],
        [db.sequelize.literal("(select profile_image from users where id = BlogComment.user_id)"), "profileImage"],
        [
          db.sequelize.literal("(select count(id) from comment_likes where comment_id=BlogComment.id)"),
          "commentLikeCount"
        ],
        [
          db.sequelize.literal(
            `(select count(id) from comment_likes where user_id = ${userId} and comment_id=BlogComment.id)`
          ),
          "isCommentLike"
        ]
      ]
    });

    return res.status(201).json({ comment: result });
  } catch (error) {
    next(error);
  }
};

///+ Update comment
exports.updateComment = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;
    const commentId = +params.commentId;

    const { id: userId } = req.user;
    const { title } = req.body;

    const blogAllIdList = await getAllAttributes(db.BlogPost, "id");
    const commentAllIdList = await getAllAttributes(db.BlogComment, "id");

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeri", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    //- CommentID
    if (isNaN(commentId)) throw new AppError("CommentId must be numeric", 400);
    if (!commentAllIdList.includes(commentId)) throw new AppError("CommentId not found", 400);

    //- Title
    if (!isNotEmpty(title)) throw new AppError("Comment is required", 400);

    //- Authorize of user
    const existComment = await db.BlogComment.findOne({ where: { id: commentId, blogId } });
    if (existComment.userId !== userId) throw new AppError("No authorize to update other user's comment", 403);

    await existComment.update({ contentText: title }, { where: { blogId, userId, id: commentId } });
    return res.status(200).json({ comment: title });
  } catch (error) {
    next(error);
  }
};

///+ Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;
    const commentId = +params.commentId;

    const { id: userId } = req.user;

    const blogAllIdList = await getAllAttributes(db.BlogPost, "id");
    const commentAllIdList = await getAllAttributes(db.BlogComment, "id");

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    //- CommentID
    if (isNaN(commentId)) throw new AppError("CommentId must be numeric", 400);
    if (!commentAllIdList.includes(commentId)) throw new AppError("CommentId not found", 400);

    //- Authorize of user
    const existComment = await db.BlogComment.findOne({ where: { id: commentId, blogId } });
    if (existComment.userId !== userId) throw new AppError("No authorize to delete other user's comment", 403);

    const commentLike = await db.CommentLike.findAll({ where: { commentId } });

    if (commentLike.length) await db.CommentLike.destroy({ where: { commentId } });
    await existComment.destroy();

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};

///+ Toggle comment like
exports.toggleCommentLike = async (req, res, next) => {
  try {
    const params = req.params;
    const commentId = +params.commentId;

    const { id: userId } = req.user;

    const commentAllIdList = await getAllAttributes(db.BlogComment, "id");

    //+Validation
    //- CommentID
    if (isNaN(commentId)) throw new AppError("CommentId must be numeric", 400);
    if (!commentAllIdList.includes(commentId)) throw new AppError("CommentId not found", 400);

    const [commentLike, created] = await db.CommentLike.findOrCreate({ where: { userId, commentId } });

    if (created) return res.status(201).json({ commentLike: { id: commentLike.id, userId: commentLike.userId } });
    else {
      await commentLike.destroy();
      return res.status(200).json({ commentLike: null });
    }
  } catch (error) {
    next(error);
  }
};
