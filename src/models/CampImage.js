const constant = require("../config/constant");
const { COVER, IMAGE } = constant;
module.exports = (sequelize, DataTypes) => {
  const CampImage = sequelize.define(
    "CampImage",
    {
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          isUrl: true
        }
      },
      type: {
        type: DataTypes.ENUM(COVER, IMAGE),
        allowNull: false,
        defaultValue: IMAGE
      }
    },
    {
      underscored: true
    }
  );

  CampImage.associate = (db) => {
    CampImage.belongsTo(db.Camp, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return CampImage;
};
