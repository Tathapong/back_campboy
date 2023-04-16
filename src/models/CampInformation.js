module.exports = (sequelize, DataTypes) => {
  const CampInformation = sequelize.define(
    "CampInformation",
    {
      subTitle1: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          notEmpty: true
        }
      },
      subTitle2: {
        type: DataTypes.STRING(5000),
        allowNull: true,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      underscored: true
    }
  );

  CampInformation.associate = (db) => {
    CampInformation.belongsTo(db.Camp, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    CampInformation.belongsTo(db.InformationItem, {
      foreignKey: {
        name: "informationItemId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return CampInformation;
};
