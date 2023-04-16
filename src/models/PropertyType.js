module.exports = (sequelize, DataTypes) => {
  const PropertyType = sequelize.define(
    "PropertyType",
    {
      title: {
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

  PropertyType.associate = (db) => {
    PropertyType.hasMany(db.CampProperty, {
      foreignKey: {
        name: "propertyTypeId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return PropertyType;
};
