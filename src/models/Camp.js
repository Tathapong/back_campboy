module.exports = (sequelize, DataTypes) => {
  const Camp = sequelize.define(
    "Camp",
    {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      locationLat: {
        type: DataTypes.DECIMAL(9, 6),
        validate: {
          notEmpty: true
        }
      },
      locationLng: {
        type: DataTypes.DECIMAL(9, 6),
        validate: {
          notEmpty: true
        }
      },
      overview: {
        type: DataTypes.STRING(5000),
        validate: {
          notEmpty: true
        }
      }
    },
    {
      underscored: true
    }
  );

  Camp.associate = (db) => {
    Camp.belongsTo(db.Province, {
      foreignKey: {
        name: "provinceId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });

    Camp.hasMany(db.CampImage, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });

    Camp.hasMany(db.CampContact, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    Camp.hasMany(db.CampInformation, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    Camp.hasMany(db.CampProperty, {
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    Camp.hasMany(db.ReviewPost, {
      as: "ReviewPosts",
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    Camp.hasMany(db.ReviewPost, {
      as: "OverallRating",
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return Camp;
};
