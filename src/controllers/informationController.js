const db = require("../models/index");
const { SERVICE, ACTIVITY } = require("../config/constant");

///+ Get provinces
exports.getProvinces = async (req, res, next) => {
  try {
    const provinces = await db.Province.findAll({ attributes: ["id", "name", ["id", "value"]] });
    return res.status(200).json({ provinces: provinces });
  } catch (error) {
    next(error);
  }
};

///+ Get filter checkbox
exports.getFliterCheckbox = async (req, res, next) => {
  try {
    const informationItems = await db.InformationItem.findAll({
      attributes: { exclude: ["iconImage", "createdAt", "updatedAt"] }
    });
    const properties = await db.PropertyType.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] }
    });

    const services = informationItems.filter((item) => item.type === SERVICE);
    const activities = informationItems.filter((item) => item.type === ACTIVITY);

    const rating = [
      { id: 1, title: 1 },
      { id: 2, title: 2 },
      { id: 3, title: 3 },
      { id: 4, title: 4 },
      { id: 5, title: 5 }
    ];

    return res.status(200).json({
      filterCheckboxs: {
        properties: properties,
        services: services,
        activities: activities,
        rating
      }
    });
  } catch (error) {
    next(error);
  }
};

///+ Get properties
exports.getProperties = async (req, res, next) => {
  try {
    const properties = await db.PropertyType.findAll({ attributes: ["id", ["title", "label"], ["title", "value"]] });
    return res.status(200).json({ properties });
  } catch (error) {
    next(error);
  }
};
