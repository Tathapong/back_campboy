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
      as: "following",
      foreignKey: { name: "accountId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    FollowUser.belongsTo(db.User, {
      as: "follower",
      foreignKey: { name: "followingId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return FollowUser;
};
