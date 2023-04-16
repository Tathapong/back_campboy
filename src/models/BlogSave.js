module.exports = (sequelize, DataTypes) => {
  const BlogSave = sequelize.define(
    "BlogSave",
    {},
    {
      underscored: true
    }
  );

  BlogSave.associate = (db) => {
    BlogSave.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    BlogSave.belongsTo(db.BlogPost, {
      foreignKey: { name: "blogId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };
  return BlogSave;
};
