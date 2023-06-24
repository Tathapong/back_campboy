const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = require("../models/index");
const { sendEmail, htmlSignupVerify, htmlResetPassword } = require("../utilities/sendEmail");

const constant = require("../config/constant");
const AppError = require("../utilities/appError");

function genToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY || "private_key", {
    expiresIn: process.env.JWT_EXPIRES || "30d"
  });
}

///+ Validate function
const isNotEmpty = (input) => input && input.trim();
const isEmail = (input) => validator.isEmail(input);
const isStrongPassword = (input) => validator.isStrongPassword(input);

///+                                                                                                                              +
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    //+ Validation
    //- Check existing of input and no empty string (White-space)
    if (!isNotEmpty(firstName)) throw new AppError("First name is required", 400);
    if (!isNotEmpty(lastName)) throw new AppError("Last name is required", 400);
    if (!isNotEmpty(email)) throw new AppError("Email address is required", 400);
    if (!isNotEmpty(password)) throw new AppError("Password is required", 400);
    if (!isNotEmpty(confirmPassword)) throw new AppError("Confirm password is required", 400);

    //- Check is email format
    if (!isEmail(email)) throw new AppError("Email address is invalid format", 400);

    //- Check strong password
    if (!isStrongPassword(password))
      throw new AppError(
        "Password must be strong (min length : 8, min lowercase :1, min uppercase : 1, min numbers : 1, min symbols : 1)",
        400
      );

    //- Check password match confirm password
    if (password !== confirmPassword) throw new AppError("Password and confirm password did not match", 400);

    //+ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //+ Insert to DataBase
    const user = await db.User.create({
      firstName,
      lastName,
      password: hashedPassword,
      email,
      profileImage: process.env.CLOUDINARY_DEFAULT_PROFILE_IMAGE,
      coverImage: process.env.CLOUDINARY_DEFAULT_COVER_IMAGE
    });

    //+ Create token in UserToken for verification
    const hashedToken = crypto.randomBytes(32).toString("hex");
    await db.UserToken.create({ userId: user.id, token: hashedToken });

    //+ Send verification email
    const optionEmail = { email, subject: "Campboy verification", html: htmlSignupVerify(user.id, hashedToken) };
    await sendEmail(optionEmail);

    return res.status(201).json();
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      error.message = "Email address is already exists";
      error.statusCode = 409;
    }
    next(error);
  }
};

///+                                                                                                                              +
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //+ Validation
    //- Check existing of input and no empty string (White-space)
    if (!isNotEmpty(email)) throw new AppError("Email address is required", 400);
    if (!isNotEmpty(password)) throw new AppError("Password is required", 400);

    //- Check existing of user by email
    const user = await db.User.findOne({ where: { email } });
    if (!user) throw new AppError("Email address  does not exist", 400);

    //- Check correct password
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) throw new AppError("Email address or password is invalid", 400);

    const token = genToken({ id: user.id });

    //+ If verify send Token
    if (user.verify) return res.status(200).json({ verify: user.verify, token });
    else return res.status(200).json({ verify: user.verify });
  } catch (err) {
    next(err);
  }
};

///+                                                                                                                              +
exports.getMe = async (req, res, next) => {
  return res.status(200).json({ user: req.user });
};

///+                                                                                                                              +
exports.changePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    //+ Validation
    //- Check existing of input and no Empty string (White-space)
    if (!isNotEmpty(oldPassword)) throw new AppError("Old password is required", 400);
    if (!isNotEmpty(newPassword)) throw new AppError("New password is required", 400);
    if (!isNotEmpty(confirmPassword)) throw new AppError("Confirm new password is required", 400);

    //- Check strong new password
    if (!validator.isStrongPassword(newPassword))
      throw new AppError(
        "New password must be strong (min length : 8, min lowercase : 1, min uppercase : 1, min symbols : 1)",
        400
      );

    //- Check password match confirm password
    if (newPassword !== confirmPassword) throw new AppError("New password and confirm new password did not match", 400);

    //- Check correct of old password
    const { password: currentHashed } = await db.User.findOne({ where: { id: user.id }, attributes: ["password"] });
    const isCorrect = await bcrypt.compare(oldPassword, currentHashed);
    if (!isCorrect) throw new AppError("Old password was wrong", 400);

    //+ Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.User.update({ password: hashedPassword }, { where: { id: user.id } });

    const token = genToken({ id: user.id });
    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

///+                                                                                                                              +
exports.sendEmail = async (req, res, next) => {
  try {
    const { email, type } = req.body;

    //+ Validation
    //- Check existing of email
    if (!isNotEmpty(email)) throw new AppError("Email address is required", 400);

    //- Check format of email
    if (!isEmail(email)) throw new AppError("Email not in format", 400);

    //- Check existing of user in User
    const user = await db.User.findOne({ where: { email } });
    if (!user) throw new AppError("The email address have not yet signed up", 400);

    const hashedToken = crypto.randomBytes(32).toString("hex");
    const userToken = await db.UserToken.findOne({ where: { userId: user.id } });
    let optionEmail;

    ///+ case : sign up (resend)
    if (type === constant.VERIFY_SIGNUP) {
      //- Check email that verify
      if (user.verify) throw new AppError("The email address have verified", 400);

      //- Check existing of userToken
      if (!userToken) throw new AppError("Internal server error", 500);

      //+ Update new Token in UserToken
      await userToken.update({ token: hashedToken });

      //+ Option of email
      optionEmail = { email, subject: "Campboy verification", html: htmlSignupVerify(user.id, hashedToken) };
    }
    ///+ case : reset-password
    else if (type === constant.RESET_PASSWORD) {
      //- Check email that not verify
      if (!user.verify) throw new AppError("The email address have not verified", 400);

      //+ Create or Update Token in UserToken
      if (userToken) await userToken.update({ token: hashedToken });
      else await db.UserToken.create({ userId: user.id, token: hashedToken });

      //+ Option of email
      optionEmail = {
        email,
        subject: "Campboy reset password",
        html: htmlResetPassword(user.id, hashedToken)
      };
    }

    //+ Send email
    await sendEmail(optionEmail);

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};

///+                                                                                                                              +
exports.verifyEmail = async (req, res, next) => {
  try {
    const { userId, hashedToken } = req.params;

    //+ Validation

    //- Check existing of input
    if (!isNotEmpty(userId)) throw new AppError("UserId is required", 400);
    if (!isNotEmpty(hashedToken)) throw new AppError("Hashed token is required", 400);

    //- Check existing of data in UserToken
    const userToken = await db.UserToken.findOne({ where: { userId: userId, token: hashedToken } });
    if (!userToken) throw new AppError("Invalid link", 400);

    //+ Delete data in UserToken and update verify in User
    await db.UserToken.destroy({ where: { userId, token: hashedToken } });
    await db.User.update({ verify: true }, { where: { id: userId } });

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
///+                                                                                                                              +
exports.verifyLink = async (req, res, next) => {
  try {
    const { userId, hashedToken } = req.params;

    //+ Validation

    //- Check existing of input
    if (!isNotEmpty(userId)) throw new AppError("UserId is required", 400);
    if (!isNotEmpty(hashedToken)) throw new AppError("Hashed token is required", 400);

    //- Check existing of data in UserToken
    const userToken = await db.UserToken.findOne({ where: { userId: userId, token: hashedToken } });
    if (!userToken) throw new AppError("Invalid link", 400);

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};

///+                                                                                                                              +
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, hashedToken } = req.params;
    const { newPassword, confirmPassword } = req.body;

    //+ Validation

    //- Check existing of input
    if (!isNotEmpty(userId)) throw new AppError("UserId is required", 400);
    if (!isNotEmpty(hashedToken)) throw new AppError("Hashed token is required", 400);
    if (!isNotEmpty(newPassword)) throw new AppError("New password is required", 400);
    if (!isNotEmpty(confirmPassword)) throw new AppError("Confirm password is required", 400);

    //- Check strong password
    if (!isStrongPassword(newPassword))
      throw new AppError(
        "New password must be strong (min length : 8, min lowercase :1, min uppercase : 1, min numbers : 1, min symbols : 1)",
        400
      );

    //- Check password match confirm password
    if (newPassword !== confirmPassword) throw new AppError("New password and confirm password did not match", 400);

    //- Check existing of data in UserToken
    const userToken = await db.UserToken.findOne({ where: { userId: userId, token: hashedToken } });
    if (!userToken) throw new AppError("Invalid link", 400);

    //+ Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    //+ Delete data in UserToken and update password in User
    await userToken.destroy();
    await db.User.update({ password: hashedPassword }, { where: { id: userId } });

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
