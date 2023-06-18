const db = require("../models/index");

exports.getProfileById = async (req, res, next) => {
  try {
    const params = req.params;
    const profileId = +params.profileId;
    const userClassify = req.user;

    const includeOption = [
      {
        model: db.BlogPost,
        attributes: { exclude: ["updatedAt", "userId"] },
        include: [
          {
            model: db.BlogLike,
            attributes: ["id", "userId"]
          },
          {
            model: db.BlogComment,
            attributes: ["id", "userId"]
          }
        ]
      }
    ];

    if (userClassify)
      includeOption[0].include.push({
        model: db.BlogSave,
        where: { userId: userClassify.id },
        attributes: ["id", "userId"],
        separate: true
      });

    const profile = await db.User.findOne({
      where: { id: profileId },
      attributes: { exclude: ["password", "email", "verify", "createdAt", "updatedAt"] },
      include: includeOption
    });
    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};
