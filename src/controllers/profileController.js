const AppError = require("../utilities/appError");
const db = require("../models/index");

const deleteCacheImage = require("../utilities/deleteCacheImage");
const getAllAttributes = require("../utilities/getAllAttributes");
const { getPublicId, uploadImage } = require("../utilities/cloudinary");
const { isNotEmpty } = require("../validation/validation");

function getOldPublicId(url) {
  const defaultProfileImageURL = process.env.CLOUDINARY_DEFAULT_PROFILE_IMAGE;
  const defaultCoverImageURL = process.env.CLOUDINARY_DEFAULT_COVER_IMAGE;

  if (url !== defaultProfileImageURL && url !== defaultCoverImageURL) return getPublicId(url);
  else return null;
}

///+ Get profile by Id
exports.getProfileById = async (req, res, next) => {
  try {
    const params = req.params;
    const profileId = +params.profileId;

    const profileAllIdList = await getAllAttributes(db.User, "id");

    //+Validation
    //- Profile Id
    if (isNaN(profileId)) throw new AppError("ProfileId must be numeric", 404);
    if (!profileAllIdList.includes(profileId)) throw new AppError("ProfileId not found", 404);

    const profile = await db.User.findOne({
      where: { id: profileId },
      attributes: ["id", "firstName", "lastName", "profileImage", "coverImage", "about"],
      include: [
        {
          model: db.FollowUser,
          as: "follower",
          attributes: [
            ["account_id", "profileId"],
            [
              db.sequelize.literal(
                "(select concat(first_name,' ',last_name) from users where id=`follower.profileId`)"
              ),
              "profileName"
            ],
            [db.sequelize.literal("(select profile_image from users where id=`follower.profileId`)"), "profileImage"],
            [db.sequelize.literal("(select about from users where id=`follower.profileId`)"), "profileAbout"],
            [
              db.sequelize.literal("(select count(id) from follow_users where following_id=`follower.profileId`)"),
              "followerCount"
            ]
          ]
        },
        {
          model: db.FollowUser,
          as: "following",
          attributes: [
            ["following_id", "profileId"],
            [
              db.sequelize.literal(
                "(select concat(first_name,' ',last_name) from users where id=`following.profileId`)"
              ),
              "profileName"
            ],
            [db.sequelize.literal("(select profile_image from users where id=`following.profileId`)"), "profileImage"],
            [db.sequelize.literal("(select about from users where id=`following.profileId`)"), "profileAbout"],
            [
              db.sequelize.literal("(select count(id) from follow_users where following_id=`following.profileId`)"),
              "followerCount"
            ]
          ]
        }
      ],
      order: [
        [db.sequelize.literal("`follower.followerCount`"), "DESC"],
        [db.sequelize.literal("`following.followerCount`"), "DESC"]
      ]
    });

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

///+ Update profile by Id
exports.updateProfileById = async (req, res, next) => {
  try {
    const user = req.user;
    const { profileImage, coverImage } = req.files ?? { profileImage: null, coverImage: null };
    const { firstName, lastName, about } = req.body;

    const cloudinary_profile_folder = process.env.CLOUDINARY_PROFILE_FOLDER;
    const cloudinary_cover_folder = process.env.CLOUDINARY_COVER_FOLDER;

    //+ Validation
    //- Profile image
    if (profileImage && !profileImage[0].mimetype.startsWith("image/"))
      throw new AppError("File type is not image", 400);

    //- Cover image
    if (coverImage && !coverImage[0].mimetype.startsWith("image/")) throw new AppError("File type is not image", 400);

    //- First name
    if (!isNotEmpty(firstName)) throw new AppError("First name is required", 400);

    //- Last name
    if (!isNotEmpty(lastName)) throw new AppError("Last name is required", 400);

    const profile = await db.User.findOne({
      where: { id: user.id },
      attributes: { exclude: ["email", "password", "verify", "createdAt", "updatedAt"] }
    });

    const input = { firstName, lastName };

    if (!isNotEmpty(about)) input.about = null;
    else input.about = about;

    if (profileImage) {
      const oldProfileImageID = getOldPublicId(profile.profileImage);
      const newProfileImageID = await uploadImage(profileImage[0].path, cloudinary_profile_folder, oldProfileImageID);
      input.profileImage = newProfileImageID;
    }

    if (coverImage) {
      const oldCoverImageID = getOldPublicId(profile.coverImage);
      const newCoverImageID = await uploadImage(coverImage[0].path, cloudinary_cover_folder, oldCoverImageID);
      input.coverImage = newCoverImageID;
    }

    await profile.update({ ...input });

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  } finally {
    const { profileImage, coverImage } = req.files ?? { profileImage: null, coverImage: null };
    if (profileImage) deleteCacheImage([profileImage[0]]);
    if (coverImage) deleteCacheImage([coverImage[0]]);
  }
};

///+ Toggle follow
exports.toggleFollow = async (req, res, next) => {
  try {
    const params = req.params;
    const profileId = +params.profileId;

    const user = req.user;

    const profileAllIdList = await getAllAttributes(db.User, "id");

    //+Validation
    //- Profile Id
    if (isNaN(profileId)) throw new AppError("ProfileId must be numeric", 400);
    if (!profileAllIdList.includes(profileId)) throw new AppError("ProfileId not found", 400);

    const [follow, created] = await db.FollowUser.findOrCreate({
      where: { accountId: user.id, followingId: profileId }
    });

    if (created) {
      const newFollower = await db.User.findOne({
        where: { id: user.id },
        attributes: [
          ["id", "profileId"],
          [db.sequelize.literal('concat(first_name," ",last_name)'), "profileName"],
          "profileImage",
          ["about", "profileAbout"],
          [db.sequelize.literal("(select count(id) from follow_users where following_id=User.id)"), "followerCount"]
        ]
      });

      return res.status(201).json({ follow: newFollower });
    } else {
      await follow.destroy();
      return res.status(200).json({ follow: null });
    }
  } catch (error) {
    next(error);
  }
};

///+ Get accoung list top writer
exports.getAccountListTopWriter = async (req, res, next) => {
  try {
    const followList = await db.User.findAll({
      where: { verify: true },
      limit: 50,
      attributes: [
        ["id", "profileId"],
        [db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id=User.id)"), "profileName"],
        "profileImage",
        ["about", "profileAbout"],
        [db.sequelize.literal("(select count(id) from follow_users where following_id=User.id)"), "followerCount"]
      ],
      order: [["followerCount", "DESC"]]
    });
    return res.status(200).json({ followList });
  } catch (error) {
    next(error);
  }
};
