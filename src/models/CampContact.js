const constant = require("../config/constant");
const { PHONE, FACEBOOK, LINE, INSTAGRAM, TWITTER, WEBSITE, ETC } = constant;

module.exports = (sequelize, DataTypes) => {
  const CampContact = sequelize.define(
    "CampContact",
    {
      type: {
        type: DataTypes.ENUM(PHONE, FACEBOOK, LINE, INSTAGRAM, TWITTER, WEBSITE, ETC),
        allowNull: false,
        defaultValue: ETC
      },
      contact: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      underscored: true
    }
  );

  CampContact.associate = (db) => {
    CampContact.belongsTo(db.Camp, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return CampContact;
};
