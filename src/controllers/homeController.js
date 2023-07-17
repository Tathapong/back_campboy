const db = require("../models/index");
const { Op } = require("sequelize");

///+ Random camp
exports.randomCamp = async (req, res, next) => {
  try {
    const campIdList = await db.Camp.findAll({ attributes: ["id"], raw: true }).then((res) => {
      return res.map((item) => item.id);
    });
    const randomId = campIdList[Math.floor(Math.random() * campIdList.length)];
    const camp = await db.Camp.findOne({ where: { id: randomId }, attributes: ["name"] });
    return res.status(200).json({ camp });
  } catch (error) {
    next(error);
  }
};

///+ Get top camp
exports.getTopCamp = async (req, res, next) => {
  try {
    const camps = await db.Camp.findAll({
      attributes: [
        "id",
        "name",
        [db.sequelize.literal("(select name from provinces where id=Camp.province_id)"), "provinceName"],
        [db.sequelize.literal("(select image from camp_images where camp_id=Camp.id and type='COVER')"), "campImage"],
        [
          db.sequelize.literal("(select round(avg(rating)) from review_posts where camp_id=Camp.id group by camp_id )"),
          "averageRating"
        ],
        [db.sequelize.literal("(select count(id) from review_posts where camp_id=Camp.id)"), "reviewCount"],
        [db.sequelize.literal("(select sum(rating) from review_posts where camp_id=Camp.id)"), "scores"]
      ],
      order: [[db.sequelize.literal("scores"), "DESC"]],
      limit: 4
    });
    return res.status(200).json({ camps });
  } catch (error) {
    next(error);
  }
};

///+ Get more post
exports.getMorePost = async (req, res, next) => {
  try {
    const topBlogs = await db.BlogPost.findAll({
      attributes: [
        "id",
        "title",
        "content",
        "featureImage",
        "createdAt",
        [db.sequelize.literal("(select count(id) from blog_likes where blog_id=BlogPost.id)"), "likeCount"],
        [db.sequelize.literal("(select id from users where id=BlogPost.user_id)"), "profileId"],
        [
          db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id=BlogPost.user_id)"),
          "profileName"
        ],
        [db.sequelize.literal("(select profile_image from users where id=BlogPost.user_id)"), "profileImage"]
      ],
      limit: 2,
      order: [[db.sequelize.literal("likeCount"), "DESC"]]
    });

    const topBlogIds = topBlogs.map((blog) => blog.id);

    const recentBlogs = await db.BlogPost.findAll({
      where: { id: { [Op.ne]: topBlogIds } },
      attributes: ["id", "title", "featureImage", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    return res.status(200).json({ topBlogs, recentBlogs });
  } catch (error) {
    next(error);
  }
};

///+ Get recent review
exports.getRecentReview = async (req, res, next) => {
  try {
    const reviews = await db.ReviewPost.findAll({
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "summarize",
        "reviewText",
        "rating",
        "createdAt",
        [db.sequelize.literal("(select id from users where id=ReviewPost.user_id)"), "profileId"],
        [
          db.sequelize.literal("(select concat(first_name,' ',last_name) from users where id=ReviewPost.user_id)"),
          "profileName"
        ],
        [db.sequelize.literal("(select profile_image from users where id=ReviewPost.user_id)"), "profileImage"],
        [db.sequelize.literal("(select id from camps where id=ReviewPost.camp_id)"), "campId"],
        [db.sequelize.literal("(select name from camps where id=ReviewPost.camp_id)"), "campName"],
        [db.sequelize.literal("(select province_id from camps where id=ReviewPost.camp_id)"), "provinceId"],
        [db.sequelize.literal("(select name from provinces where id=provinceId)"), "provinceName"]
      ],
      limit: 4,
      order: [[db.sequelize.literal("createdAt"), "DESC"]]
    });
    return res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};
