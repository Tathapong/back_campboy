module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      profileImage: {
        type: DataTypes.STRING(255),
        validate: {
          isUrl: true,
          notEmpty: true
        }
      },
      coverImage: {
        type: DataTypes.STRING(255),
        validate: {
          isUrl: true,
          notEmpty: true
        }
      },
      about: {
        type: DataTypes.STRING(255),
        validate: {
          notEmpty: true
        }
      },
      verify: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      underscored: true
    }
  );

  User.associate = (db) => {
    User.hasMany(db.ReviewPost, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });

    User.hasMany(db.FollowUser, {
      as: "following",
      foreignKey: { name: "accountId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasMany(db.FollowUser, {
      as: "follower",
      foreignKey: { name: "followingId", allowNull: false },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasMany(db.CommentLike, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasMany(db.BlogComment, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasMany(db.BlogLike, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasMany(db.BlogSave, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasMany(db.BlogPost, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
    User.hasOne(db.UserToken, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return User;
};
