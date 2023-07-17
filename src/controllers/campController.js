const { Op } = require("sequelize");

const db = require("../models/index");
const campService = require("../services/campService");
const AppError = require("../utilities/appError");
const getAllAttributes = require("../utilities/getAllAttributes");
const { isEachNumber, isEachInRange, isNotEmpty } = require("../validation/validation");

///+ Get camp by Id
exports.getCampById = async (req, res, next) => {
  try {
    const params = req.params;
    const campId = +params.campId;

    const campAllIdList = await getAllAttributes(db.Camp, "id");

    //+ Validation
    if (isNaN(campId)) throw new AppError("CampId must be numeric", 404);
    if (!campAllIdList.includes(campId)) throw new AppError("CampId not found", 404);

    const camp = await db.Camp.findOne({
      where: { id: campId },
      attributes: [
        "id",
        "name",
        "locationLat",
        "locationLng",
        "overview",
        [db.sequelize.literal("(select id from provinces where id=Camp.province_id)"), "provinceId"],
        [db.sequelize.literal("(select name from provinces where id=Camp.province_id)"), "provinceName"],
        [db.sequelize.literal("(select round(avg(rating)) from review_posts where camp_id=Camp.id )"), "scores"]
      ],

      include: [
        { model: db.CampImage, attributes: ["id", ["image", "src"]] },
        { model: db.CampContact, attributes: ["id", "type", "contact"] },
        {
          model: db.CampInformation,
          attributes: [
            "id",
            "subTitle1",
            "subTitle2",
            [
              db.sequelize.literal(
                "(select type from information_items where id=CampInformations.information_item_id)"
              ),
              "type"
            ],
            [
              db.sequelize.literal(
                "(select title from information_items where id=CampInformations.information_item_id)"
              ),
              "title"
            ],
            [
              db.sequelize.literal(
                "(select icon_image from information_items where id=CampInformations.information_item_id)"
              ),
              "iconImage"
            ]
          ]
        },
        {
          model: db.ReviewPost,
          as: "ReviewPosts",
          attributes: [
            "id",
            "summarize",
            "reviewText",
            "rating",
            "createdAt",
            ["user_id", "profileId"],
            [
              db.sequelize.literal("concat(`ReviewPosts->User`.first_name,' ',`ReviewPosts->User`.last_name)"),
              "profileName"
            ],
            [db.sequelize.literal("`ReviewPosts->User`.profile_image"), "profileImage"]
          ],
          include: {
            model: db.User,
            attributes: []
          }
        },
        {
          model: db.ReviewPost,
          as: "OverallRating",
          attributes: []
        }
      ],
      order: [[db.sequelize.literal("ReviewPosts.created_at"), "DESC"]]
    });

    if (!camp) throw new AppError("Internal server error", 500);

    return res.status(200).json({ camp: camp });
  } catch (error) {
    next(error);
  }
};

///+ Filter all camp
exports.filterAllCamp = async (req, res, next) => {
  try {
    const { destination, province, rating, property, informationItem } = req.query;

    //+ Get range of data
    const provinceAllIdList = await getAllAttributes(db.Province, "id");
    const propertyAllIdList = await getAllAttributes(db.PropertyType, "id");
    const infoAllIdList = await getAllAttributes(db.InformationItem, "id");

    //+Validation
    //- Destination
    if (destination && typeof destination !== "string") throw new AppError("Destination must be string", 400);

    //- Province
    if (province) {
      if (isNaN(+province) || typeof province === "object") throw new AppError("Province must be numeric", 400);
      if (!provinceAllIdList.includes(+province)) throw new AppError("Province not found", 400);
    }

    //- Rating
    if (rating) {
      if (!Array.isArray(rating)) throw new AppError("Rating must be array");
      if (!isEachNumber(rating)) throw new AppError("Each of value must be numeric");
      if (!isEachInRange(rating, [1, 2, 3, 4, 5])) throw new AppError("Each of value must be in range", 400);
    }

    //- Property
    if (property) {
      if (!Array.isArray(property)) throw new AppError("Property must be array", 400);
      if (!isEachNumber(property)) throw new AppError("Each of value must be numeric");
      if (!isEachInRange(property, propertyAllIdList)) throw new AppError("Each of value must be in range", 400);
    }

    //- InformationItem
    if (informationItem) {
      if (!Array.isArray(informationItem)) throw new AppError("Information item must be array", 400);
      if (!isEachNumber(informationItem)) throw new AppError("Each of value must be numeric");
      if (!isEachInRange(informationItem, infoAllIdList)) throw new AppError("Each of value must be in range", 400);
    }

    const campIdByDestination = await db.sequelize
      .query(destination ? `select id from camps where name like '%${destination}%'` : "select id from camps", {
        type: db.sequelize.QueryTypes.SELECT
      })
      .then((res) => res.map((item) => item.id));

    const campIdByProvince = await db.sequelize
      .query(province ? `select id from camps where province_id=${province}` : "select id from camps", {
        type: db.sequelize.QueryTypes.SELECT
      })
      .then((res) => res.map((item) => item.id));

    const campIdByProperty = await db.sequelize
      .query(
        property
          ? `select camp_id id from camp_properties where property_type_id in (${property.join(
              ","
            )}) group by camp_id having count(camp_id)=${property.length}`
          : "select id from camps",
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      )
      .then((res) => res.map((item) => item.id));

    const campIdByRating = await db.sequelize
      .query(
        rating
          ? `select camp_id id from review_posts group by camp_id having round(avg(rating)) in (${rating.join(",")})`
          : `select id from camps`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      )
      .then((res) => res.map((item) => item.id));

    const campIdByInformation = await db.sequelize
      .query(
        informationItem
          ? `select camp_id id from camp_informations where information_item_id in (${informationItem.join(
              ","
            )}) group by camp_id having count(camp_id)=${informationItem.length}`
          : "select id from camps",
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      )
      .then((res) => res.map((item) => item.id));

    req.campFilterList = campService.findMatchId(
      campIdByDestination,
      campIdByProvince,
      campIdByProperty,
      campIdByRating,
      campIdByInformation
    );
    next();
  } catch (error) {
    next(error);
  }
};

///+ Get all camp
exports.getAllCamp = async (req, res, next) => {
  try {
    const { campFilterList } = req;
    const camps = await db.Camp.findAll({
      where: { id: { [Op.in]: campFilterList } },
      attributes: [
        "id",
        "name",
        "locationLat",
        "locationLng",
        "createdAt",
        [db.sequelize.literal("(select image from camp_images where camp_id=Camp.id and type='COVER')"), "coverImage"],
        [db.sequelize.literal("(select name from provinces where Camp.province_id = id )"), "provinceName"],
        [db.sequelize.literal("(select round(avg(rating)) from review_posts where camp_id=Camp.id )"), "scores"],
        [db.sequelize.literal("(select count(id) from review_posts where camp_id=Camp.id)"), "reviewCount"]
      ],
      include: [
        {
          model: db.CampInformation,
          where: { information_item_id: [16, 17, 11, 12] },
          attributes: [
            "id",
            "subTitle1",
            [
              db.sequelize.literal(
                "(select title from information_items where id=CampInformations.information_item_id)"
              ),
              "title"
            ],
            [
              db.sequelize.literal(
                "(select icon_image from information_items where id=CampInformations.information_item_id)"
              ),
              "iconImage"
            ]
          ]
        }
      ],
      order: [[db.sequelize.literal("Camp.id"), "ASC"]]
    });
    return res.status(200).json({ camps });
  } catch (error) {
    next(error);
  }
};

///+ Write review
exports.writeReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { rating, summarize, reviewText, campId } = req.body;

    const campAllIdList = await getAllAttributes(db.Camp, "id");

    //+Validation

    //- CampId
    if (isNaN(campId)) throw new AppError("CampId must be numeric", 400);
    if (!campAllIdList.includes(+campId)) throw new AppError("CampId not found", 400);

    //- Rating
    if (rating && (isNaN(+rating) || typeof +rating !== "number")) throw new AppError("Rating must be numeric", 400);
    if (![1, 2, 3, 4, 5].includes(+rating)) throw new AppError("Rating must be in range");

    //- Summarize
    if (!isNotEmpty(summarize)) throw new AppError("Summarize is required", 400);

    //- ReviewText
    if (!isNotEmpty(reviewText)) throw new AppError("Review text is required", 400);

    const reviewPost = await db.ReviewPost.create({ summarize, reviewText, rating, campId, userId: user.id });
    const result = await db.ReviewPost.findOne({
      where: { id: reviewPost.id },
      attributes: [
        "id",
        "summarize",
        "reviewText",
        "rating",
        "createdAt",
        ["user_id", "profileId"],
        [
          db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id=ReviewPost.user_id)"),
          "profileName"
        ],
        [db.sequelize.literal("(select profile_image from users where id=ReviewPost.user_id)"), "profileImage"]
      ]
    });
    return res.status(201).json({ reviewPost: result });
  } catch (error) {
    next(error);
  }
};

///+ Update review
exports.updateReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { reviewId } = req.params;
    const { rating, summarize, reviewText } = req.body;

    const reviewAllIdList = await getAllAttributes(db.ReviewPost, "id");

    //+Validation

    //- ReviewId
    if (isNaN(reviewId)) throw new AppError("ReviewId must be numeric", 400);
    if (!reviewAllIdList.includes(+reviewId)) throw new AppError("ReviewId not found", 400);

    //- Rating
    if (isNaN(rating)) throw new AppError("Rating must be numeric", 400);
    if (![1, 2, 3, 4, 5].includes(+rating)) throw new AppError("Rating must be in range");

    //- Summarize
    if (!isNotEmpty(summarize)) throw new AppError("Summarize is required", 400);

    //- ReviewText
    if (!isNotEmpty(reviewText)) throw new AppError("Review text is required", 400);

    //- Authorize of user
    const existReview = await db.ReviewPost.findOne({ where: { id: reviewId } });
    if (existReview.userId !== user.id) throw new AppError("No authorize to update other user's comment", 403);

    await existReview.update({ summarize, reviewText, rating });
    return res.status(200).json({
      reviewPost: {
        id: existReview.id,
        summarize: existReview.summarize,
        reviewText: existReview.reviewText,
        rating: existReview.rating
      }
    });
  } catch (error) {
    next(error);
  }
};

///+ Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { reviewId } = req.params;

    const reviewAllIdList = await getAllAttributes(db.ReviewPost, "id");

    //+Validation
    //- ReviewId
    if (isNaN(reviewId)) throw new AppError("ReviewId must be numeric", 400);
    if (!reviewAllIdList.includes(+reviewId)) throw new AppError("ReviewId not found", 400);

    //- Authorize of user
    const existReview = await db.ReviewPost.findOne({ where: { id: reviewId } });
    if (existReview.userId !== user.id) throw new AppError("No authorize to delete other user's comment", 403);

    await existReview.destroy();
    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
