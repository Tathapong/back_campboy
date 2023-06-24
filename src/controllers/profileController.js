const AppError = require("../utilities/appError");
const db = require("../models/index");
const deleteCacheImage = require("../utilities/deleteCacheImage");
const cloudinary = require("../utilities/cloudinary");
const { getAllId } = require("../utilities/getAllModelId");
const { isNotEmpty } = require("../validation/validation");

function getPublicId(url, folderPath) {
  const defaultProfileImageURL = process.env.CLOUDINARY_DEFAULT_PROFILE_IMAGE;
  const defaultCoverImageURL = process.env.CLOUDINARY_DEFAULT_COVER_IMAGE;

  let fileName;

  if (url !== defaultProfileImageURL && url !== defaultCoverImageURL) {
    fileName = cloudinary.getPublicId(url);
    if (folderPath) return `${folderPath}/${fileName}`;
    else return fileName;
  } else return null;
}

exports.getProfileById = async (req, res, next) => {
  try {
    const params = req.params;
    const profileId = +params.profileId;
    const userClassify = req.user;

    const profileAllIdList = await getAllId(db.User);

    //+Validation
    //- Profile Id
    if (isNaN(profileId)) throw new AppError("ProfileId must be numeric", 400);
    if (!profileAllIdList.includes(profileId)) throw new AppError("ProfileId not found", 404);

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
      },
      {
        model: db.FollowUser,
        as: "follower",
        attributes: ["id", "accountId"],
        include: [
          {
            model: db.User,
            as: "following",
            attributes: ["firstName", "lastName", "profileImage"]
          }
        ]
      },
      {
        model: db.FollowUser,
        as: "following",
        attributes: ["id", "followingId"],
        include: [
          {
            model: db.User,
            as: "follower",
            attributes: ["firstName", "lastName", "profileImage"]
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
    console.log(error);
    next(error);
  }
};

exports.updateProfileById = async (req, res, next) => {
  try {
    const user = req.user;

    const { profileImage, coverImage } = req.files;
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
      const oldProfileImageID = getPublicId(profile.profileImage);
      const newProfileImageID = await cloudinary.uploadImage(
        profileImage[0].path,
        cloudinary_profile_folder,
        oldProfileImageID
      );
      input.profileImage = newProfileImageID;
    }

    if (coverImage) {
      const oldCoverImageID = getPublicId(profile.coverImage);
      const newCoverImageID = await cloudinary.uploadImage(
        coverImage[0].path,
        cloudinary_cover_folder,
        oldCoverImageID
      );
      input.coverImage = newCoverImageID;
    }

    await profile.update({ ...input });

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  } finally {
    const { profileImage, coverImage } = req.files;
    if (profileImage) deleteCacheImage([profileImage[0]]);
    if (coverImage) deleteCacheImage([coverImage[0]]);
  }
};

exports.toggleFollow = async (req, res, next) => {
  try {
    const params = req.params;
    const profileId = +params.profileId;

    const user = req.user;

    const profileAllIdList = await getAllId(db.User);

    //+Validation
    //- Profile Id
    if (isNaN(profileId)) throw new AppError("ProfileId must be numeric", 400);
    if (!profileAllIdList.includes(profileId)) throw new AppError("ProfileId not found", 400);

    const [follow, created] = await db.FollowUser.findOrCreate({
      where: { accountId: user.id, followingId: profileId }
    });

    if (created)
      return res
        .status(201)
        .json({ follow: { id: follow.id, accountId: follow.accountId, followingId: follow.followingId } });
    else {
      await follow.destroy();
      return res.status(200).json({ follow: null });
    }
  } catch (error) {
    next(error);
  }
};

exports.getFollowingList = async (req, res, next) => {
  try {
    const params = req.params;
    const profileId = +params.profileId;

    const profileAllIdList = await getAllId(db.User);

    //+Validation
    //- Profile Id
    if (isNaN(profileId)) throw new AppError("ProfileId must be numeric", 400);
    if (!profileAllIdList.includes(profileId)) throw new AppError("ProfileId not found", 400);

    const followingList = await db.FollowUser.findAll({
      where: { accountId: profileId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: db.User,
          as: "follower",
          attributes: ["id", "firstName", "lastName", "profileImage"]
        }
      ]
    });
    return res.status(200).json({ followingList });
  } catch (error) {
    next(error);
  }
};
