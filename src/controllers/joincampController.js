const { isNotEmpty } = require("../validation/validation");
const db = require("../models/index");
const AppError = require("../utilities/appError");

///+ Create join camp
exports.createJoincamp = async (req, res, next) => {
  try {
    const { name, provinceId, propertyType, phone, email, facebook, lineId } = req.body;

    //+Validation
    //- Name
    if (!isNotEmpty(name)) throw new AppError("Camp name is required", 400);

    //- Province Id
    if (!isNotEmpty(provinceId)) throw new AppError("Province is required", 400);

    //- PropertyType
    if (!Array.isArray(propertyType)) throw new AppError("Property type must be array", 400);
    if (!propertyType.length) throw new AppError("Property type is required", 400);

    //- Phone
    if (!isNotEmpty(phone)) throw new AppError("Phone is required", 400);

    //- Email
    if (!isNotEmpty(email)) throw new AppError("Email is required", 400);

    await db.JoinCamp.create({
      name,
      provinceId: provinceId,
      propertyType: propertyType.join(","),
      phone,
      email,
      facebook,
      lineId
    });

    return res.status(201).json();
  } catch (error) {
    next(error);
  }
};
