module.exports = (sequelize, DataTypes) => {
  const CommentLike = sequelize.define(
    "CommentLike",
    {},
    {
      underscored: true
    }
  );

  CommentLike.associate = (db) => {
    CommentLike.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    CommentLike.belongsTo(db.BlogComment, {
      foreignKey: { name: "commentId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return CommentLike;
};
