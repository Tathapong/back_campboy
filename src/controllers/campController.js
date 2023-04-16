const db = require("../models/index");
const { Op } = require("sequelize");

const AppError = require("../utilities/appError");
const campService = require("../services/campService");
const constant = require("../config/constant");
const { isEachNumber, isEachInRange, isNumericString, isInRange } = require("../validation/validation");

async function getAllId(model) {
  try {
    const idList = await model.findAll({ attributes: ["id"] });
    return idList.map((item) => item.id);
  } catch (error) {
    throw error;
  }
}
///+ Validate function
const isNotEmpty = (input) => input && input.trim();

///+                                                                                                                              +
exports.getCampById = async (req, res, next) => {
  try {
    const params = req.params;
    const campId = +params.campId;
    const campAllIdList = await getAllId(db.Camp);

    //+ Validation
    if (isNaN(campId)) throw new AppError("campId must be numeric", 400);
    if (!campAllIdList.includes(campId)) throw new AppError("campId was out of range", 400);

    const camp = await db.Camp.findOne({
      where: { id: campId },
      attributes: { exclude: ["createdAt", "updatedAt", "provinceId"] },
      include: [
        { model: db.CampImage, attributes: { exclude: ["createdAt", "updatedAt", "campId"] } },
        { model: db.Province, attributes: { exclude: ["createdAt", "updatedAt"] } },
        { model: db.CampContact, attributes: { exclude: ["createdAt", "updatedAt", "campId"] } },
        {
          model: db.CampInformation,
          include: { model: db.InformationItem, attributes: { exclude: ["createdAt", "updatedAt"] } },
          attributes: {
            exclude: ["createdAt", "updatedAt", "campId", "informationItemId"]
          }
        },
        {
          model: db.CampProperty,
          include: { model: db.PropertyType, attributes: { exclude: ["createdAt", "updatedAt"] } },
          attributes: { exclude: ["createdAt", "updatedAt", "campId", "propertyTypeId"] }
        },
        {
          model: db.ReviewPost,
          as: "ReviewPosts",
          include: {
            model: db.User,
            attributes: {
              exclude: ["createdAt", "updatedAt", "email", "mobile", "password", "coverImage", "about", "verify"]
            }
          },
          attributes: {
            exclude: ["updatedAt", "campId", "userId"]
          },
          order: [[db.ReviewPost, "createdAt", "DESC"]]
        },
        {
          model: db.ReviewPost,
          as: "OverallRating",
          attributes: [[db.sequelize.fn("round", db.sequelize.fn("avg", db.sequelize.col("rating"))), "rating"]],
          group: "campId",
          separate: true
        }
      ]
    });

    if (!camp) throw new AppError("Internal server error", 500);

    return res.status(200).json({ camp: camp });
  } catch (error) {
    next(error);
  }
};

///+                                                                                                                              +
exports.filterAllCamp = async (req, res, next) => {
  try {
    const { destination, province, rating, property, informationItem } = req.query;

    //+ Get range of data
    const provinceAllIdList = await getAllId(db.Province);
    const propertyAllIdList = await getAllId(db.PropertyType);
    const infoAllIdList = await getAllId(db.InformationItem);

    //+Validation
    //- Destination
    if (destination && typeof destination !== "string") throw new AppError("destination must be string", 400);

    //- Province
    if (province && (isNaN(+province) || typeof +province !== "number"))
      throw new AppError("province must be numeric", 400);
    if (province && !provinceAllIdList.includes(+province)) throw new AppError("province must be in range", 400);

    //- Rating
    if (rating && !Array.isArray(rating)) throw new AppError("Rating must be array");
    if (!isEachNumber(rating)) throw new AppError("each of value must be numeric");
    if (!isEachInRange(rating, [1, 2, 3, 4, 5])) throw new AppError("each of value must be in range", 400);

    //- Property
    if (property && !Array.isArray(property)) throw new AppError("Property must be array", 400);
    if (!isEachNumber(property)) throw new AppError("each of value must be numeric");
    if (!isEachInRange(property, propertyAllIdList)) throw new AppError("each of value must be in range", 400);

    //- InformationItem
    if (informationItem && !Array.isArray(informationItem)) throw new AppError("Information item must be array", 400);
    if (!isEachNumber(informationItem)) throw new AppError("each of value must be numeric");
    if (!isEachInRange(informationItem, infoAllIdList)) throw new AppError("each of value must be in range", 400);

    //+ Where
    const destinationWhere = destination ? { name: { [Op.substring]: destination } } : {};
    const provinceWhere = province ? { province_id: +province } : {};

    const propertyWhere = property ? campService.createFilterWhere(property, "property_type_id") : {};
    const informationItemWhere = informationItem
      ? campService.createFilterWhere(informationItem, "information_item_id")
      : {};

    //+ Group
    const propertyGroup = property ? "camp_id" : "";
    const informationItemGroup = informationItem ? "camp_id" : "";
    const ratingGroup = rating ? "camp_id" : "";

    //+ Having
    const informationItemHaving = informationItem
      ? campService.createFilterHaving(informationItem, "information_item_id")
      : {};
    const ratingHaving = rating
      ? db.sequelize.where(db.sequelize.fn("round", db.sequelize.fn("avg", db.sequelize.col("rating"))), {
          [Op.in]: rating
        })
      : {};

    //+ CampId by
    const campByProvinceDest = await campService.convertToIdList({
      model: db.Camp,
      where: [provinceWhere, destinationWhere],
      columnName: "id"
    });
    const campByProperty = await campService.convertToIdList({
      model: db.CampProperty,
      where: propertyWhere,
      group: propertyGroup,
      columnName: "campId"
    });
    const campByRating =
      rating?.length || rating !== undefined
        ? await campService.convertToIdList({
            model: db.ReviewPost,
            group: ratingGroup,
            having: ratingHaving,
            columnName: "campId"
          })
        : await campService.convertToIdList({ model: db.Camp, columnName: "id" });

    const campByInformationItem = await campService.convertToIdList({
      model: db.CampInformation,
      where: informationItemWhere,
      columnName: "campId",
      group: informationItemGroup,
      having: informationItemHaving
    });

    req.campFilterList = campService.findMatchId(
      campByProvinceDest,
      campByProperty,
      campByRating,
      campByInformationItem
    );
    next();
  } catch (error) {
    next(error);
  }
};

///+                                                                                                                              +
exports.getAllCamp = async (req, res, next) => {
  try {
    const { campFilterList } = req;
    const campsWhere = campService.createFilterWhere(campFilterList, "id");

    const camps = await db.Camp.findAll({
      where: campsWhere,
      attributes: { exclude: ["updatedAt", "provinceId", "overview"] },
      include: [
        {
          model: db.CampImage,
          attributes: { exclude: ["createdAt", "updatedAt", "campId"] },
          where: { type: constant.COVER }
        },
        { model: db.Province, attributes: { exclude: ["createdAt", "updatedAt"] } },
        {
          model: db.CampInformation,
          include: {
            model: db.InformationItem,
            where: { [Op.or]: [{ id: 16 }, { id: 17 }, { id: 11 }, { id: 12 }] }, // Service charge, Limit people, check-in, check-out
            attributes: { exclude: ["createdAt", "updatedAt"] }
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "campId"]
          }
        },
        {
          model: db.ReviewPost,
          as: "OverallRating",
          attributes: [
            [db.sequelize.fn("round", db.sequelize.fn("avg", db.sequelize.col("rating"))), "rating"],
            [db.sequelize.fn("count", db.sequelize.col("rating")), "count"]
          ],
          group: "campId",
          separate: true
        }
      ]
    });
    return res.status(200).json({ camps: camps });
  } catch (error) {
    next(error);
  }
};

///+                                                                                                                              +
exports.writeReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { rating, summarize, reviewText, campId } = req.body;

    //+Validation
    //- Rating
    if (!rating) throw new AppError("Rating is required", 400);
    if (rating && (isNaN(+rating) || typeof +rating !== "number")) throw new AppError("Rating must be numeric", 400);
    if (![1, 2, 3, 4, 5].includes(+rating)) throw new AppError("Rating must be in range");

    //- Summarize
    if (!isNotEmpty(summarize)) throw new AppError("Summarize is required", 400);

    //- ReviewText
    if (!isNotEmpty(reviewText)) throw new AppError("Review text is required", 400);

    const reviewPost = await db.ReviewPost.create({ summarize, reviewText, rating, campId, userId: user.id });
    return res.status(201).json({ reviewPost: reviewPost });
  } catch (error) {
    next(error);
  }
};
