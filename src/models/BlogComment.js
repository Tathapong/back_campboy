module.exports = (sequelize, DataTypes) => {
  const BlogComment = sequelize.define(
    "BlogComment",
    {
      contentText: {
        type: DataTypes.STRING(5000),
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

  BlogComment.associate = (db) => {
    BlogComment.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    BlogComment.belongsTo(db.BlogPost, {
      foreignKey: { name: "blogId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });

    BlogComment.hasMany(db.CommentLike, {
      foreignKey: { name: "commentId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return BlogComment;
};
