module.exports = (sequelize, DataTypes) => {
  const FollowUser = sequelize.define(
    "FollowUser",
    {},
    {
      underscored: true
    }
  );

  FollowUser.associate = (db) => {
    FollowUser.belongsTo(db.User, {
      as: "user",
      foreignKey: { name: "userId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    FollowUser.belongsTo(db.User, {
      as: "following",
      foreignKey: { name: "followingId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return FollowUser;
};
