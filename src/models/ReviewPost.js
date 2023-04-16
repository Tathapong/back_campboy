module.exports = (sequelize, DataTypes) => {
  const ReviewPost = sequelize.define(
    "ReviewPost",
    {
      summarize: {
        type: DataTypes.STRING(100)
      },
      reviewText: {
        type: DataTypes.STRING(5000),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      rating: {
        type: DataTypes.ENUM("1", "2", "3", "4", "5"),
        allowNull: false,
        defaultValue: "5"
      }
    },
    {
      underscored: true
    }
  );

  ReviewPost.associate = (db) => {
    ReviewPost.belongsTo(db.Camp, {
      as: "ReviewPosts",
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    ReviewPost.belongsTo(db.Camp, {
      as: "OverallRating",
      foreignKey: {
        name: "campId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });

    ReviewPost.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return ReviewPost;
};
