const constant = require("../config/constant");
const { PROPERTY_TYPE_TENT, PROPERTY_TYPE_GLAMPING, PROPERTY_TYPE_RVCAR, PROPERTY_TYPE_HOMESTAY } = constant;

module.exports = (sequelize, DataTypes) => {
  const JoinCamp = sequelize.define(
    "JoinCamp",
    {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      propertyType: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: PROPERTY_TYPE_TENT
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      facebook: {
        type: DataTypes.STRING(255),
        validate: {
          notEmpty: true
        }
      },
      lineId: {
        type: DataTypes.STRING(255),
        validate: {
          notEmpty: true
        }
      }
    },
    {
      underscored: true
    }
  );

  JoinCamp.associate = (db) => {
    JoinCamp.belongsTo(db.Province, {
      foreignKey: {
        name: "provinceId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return JoinCamp;
};
