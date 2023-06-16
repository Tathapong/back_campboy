const db = require("../models/index");
const AppError = require("../utilities/appError");
const { getAllId } = require("../utilities/getAllModelId");

exports.toggleSave = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;

    const { id: userId } = req.user;

    const blogAllIdList = await getAllId(db.BlogPost);

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    const [save, created] = await db.BlogSave.findOrCreate({ where: { userId, blogId } });

    if (created) return res.status(201).json({ save: { id: save.id, userId: save.userId } });
    else {
      await save.destroy();
      return res.status(200).json({ save: null });
    }
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const params = req.params;
    const blogId = +params.blogId;

    const { id: userId } = req.user;

    const blogAllIdList = await getAllId(db.BlogPost);

    //+Validation
    //- BlogID
    if (isNaN(blogId)) throw new AppError("BlogId must be numeric", 400);
    if (!blogAllIdList.includes(blogId)) throw new AppError("BlogId not found", 400);

    const [like, created] = await db.BlogLike.findOrCreate({ where: { userId, blogId } });

    if (created) return res.status(201).json({ like: { id: like.id, userId: like.userId } });
    else {
      await like.destroy();
      return res.status(200).json({ like: null });
    }
  } catch (error) {
    next(error);
  }
};
