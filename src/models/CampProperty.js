module.exports = (sequelize, DataTypes) => {
  const CampProperty = sequelize.define(
    "CampProperty",
    {},
    {
      underscored: true
    }
  );

  CampProperty.associate = (db) => {
    CampProperty.belongsTo(db.Camp, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    CampProperty.belongsTo(db.PropertyType, {
      foreignKey: {
        name: "propertyTypeId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return CampProperty;
};
