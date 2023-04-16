module.exports = (sequelize, DataTypes) => {
  const BlogPost = sequelize.define(
    "BlogPost",
    {
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      contentText: {
        type: DataTypes.STRING(5000),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      image: {
        type: DataTypes.STRING(255),
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

  BlogPost.associate = (db) => {
    BlogPost.hasMany(db.BlogComment, {
      foreignKey: { name: "blogId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    BlogPost.hasMany(db.BlogLike, {
      foreignKey: { name: "blogId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    BlogPost.hasMany(db.BlogSave, {
      foreignKey: { name: "blogId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });

    BlogPost.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return BlogPost;
};
