module.exports = (sequelize, DataTypes) => {
  const BlogLike = sequelize.define(
    "BlogLike",
    {},
    {
      underscored: true
    }
  );

  BlogLike.associate = (db) => {
    BlogLike.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    BlogLike.belongsTo(db.BlogPost, {
      foreignKey: { name: "blogId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return BlogLike;
};
