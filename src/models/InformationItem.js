const constant = require("../config/constant");
const { GENERAL, SERVICE, ACTIVITY, RULE, ETC } = constant;

module.exports = (sequelize, DataTypes) => {
  const InformationItem = sequelize.define(
    "InformationItem",
    {
      type: {
        type: DataTypes.ENUM(GENERAL, SERVICE, ACTIVITY, RULE, ETC),
        allowNull: false,
        defaultValue: ETC
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      iconImage: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          isUrl: true
        }
      }
    },
    {
      underscored: true
    }
  );

  InformationItem.associate = (db) => {
    InformationItem.hasMany(db.CampInformation, {
      foreignKey: {
        name: "informationItemId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return InformationItem;
};
