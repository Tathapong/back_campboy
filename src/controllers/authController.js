const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = require("../models/index");
const getAllAttribute = require("../utilities/getAllAttributes");
const genToken = require("../utilities/genToken");
const AppError = require("../utilities/appError");

const { VERIFY_SIGNUP, RESET_PASSWORD } = require("../config/constant");
const { isNotEmpty, isEmail, isStrongPassword } = require("../validation/validation");
const { sendEmail, htmlSignupVerify, htmlResetPassword } = require("../utilities/sendEmail");

///+ Sign up
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    const userAllEmail = await getAllAttribute(db.User, "email");

    //+ Validation
    //- First name
    if (!isNotEmpty(firstName)) throw new AppError("First name is required.", 400);

    //- Last name
    if (!isNotEmpty(lastName)) throw new AppError("Last name is required.", 400);

    //- Email address
    if (!isNotEmpty(email)) throw new AppError("Email address is required.", 400);
    if (!isEmail(email)) throw new AppError("Email address is invalid format.", 400);
    if (userAllEmail.includes(email)) throw new AppError("Email address is already exists.", 409);

    //- Password
    if (!isNotEmpty(password)) throw new AppError("Password is required.", 400);
    if (!isStrongPassword(password))
      throw new AppError(
        "Password must be strong (min length : 8, min lowercase :1, min uppercase : 1, min numbers : 1, min symbols : 1)",
        400
      );

    //- Confirm password
    if (!isNotEmpty(confirmPassword)) throw new AppError("Confirm password is required.", 400);
    if (password !== confirmPassword) throw new AppError("Password and confirm password did not match.", 400);

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
    next(error);
  }
};

///+ Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAllEmail = await getAllAttribute(db.User, "email");

    //+ Validation
    //- Email
    if (!isNotEmpty(email)) throw new AppError("Email address is required.", 400);
    if (!userAllEmail.includes(email)) throw new AppError("Email address does not exists.", 409);

    //- Password
    if (!isNotEmpty(password)) throw new AppError("Password is required", 400);

    const user = await db.User.findOne({ where: { email } });
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) throw new AppError("Email address or password is invalid", 400);

    const token = genToken({ id: user.id });

    //+ If verify send Token
    if (user.verify) return res.status(200).json({ verify: user.verify, token });
    else return res.status(200).json({ verify: user.verify });
  } catch (error) {
    next(error);
  }
};

///+ Get me
exports.getMe = async (req, res, next) => {
  return res.status(200).json({ user: req.user });
};

///+ Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    //+ Validation

    //- Old password
    if (!isNotEmpty(oldPassword)) throw new AppError("Old password is required.", 400);

    //- New password
    if (!isNotEmpty(newPassword)) throw new AppError("New password is required.", 400);
    if (oldPassword === newPassword) throw new AppError("Old password and new Passwod must not be same", 400);
    if (!isStrongPassword(newPassword))
      throw new AppError(
        "New password must be strong (min length : 8, min lowercase : 1, min uppercase : 1, min symbols : 1)",
        400
      );

    //- Confirm password
    if (!isNotEmpty(confirmPassword)) throw new AppError("Confirm new password is required.", 400);
    if (newPassword !== confirmPassword)
      throw new AppError("New password and confirm new password did not match.", 400);

    //- Check correct of old password
    const { password: currentHashed } = await db.User.findOne({
      where: { id: user.id, verify: true },
      attributes: ["password"]
    });
    const isCorrect = await bcrypt.compare(oldPassword, currentHashed);
    if (!isCorrect) throw new AppError("Old password was wrong", 400);

    //+ Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.User.update({ password: hashedPassword }, { where: { id: user.id, verify: true } });

    const token = genToken({ id: user.id });
    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

///+ Send email
exports.sendEmail = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const userAllEmail = await getAllAttribute(db.User, "email");

    //+ Validation
    //- Email
    if (!isNotEmpty(email)) throw new AppError("Email address is required.", 400);
    if (!isEmail(email)) throw new AppError("Email address is invalid format.", 400);
    if (!userAllEmail.includes(email)) throw new AppError("Email address does not exists.", 409);

    //- TYPE
    if (!(type === VERIFY_SIGNUP) && !(type == RESET_PASSWORD)) throw new AppError("Type is invalid", 400);

    const user = await db.User.findOne({ where: { email } });

    const hashedToken = crypto.randomBytes(32).toString("hex");
    const userToken = await db.UserToken.findOne({ where: { userId: user.id } });

    let optionEmail;

    //+ case : sign up (resend)
    if (type === VERIFY_SIGNUP) {
      //- Check email that verify
      if (user.verify) throw new AppError("The email address have verified.", 400);

      //- Check existing of userToken
      if (!userToken) throw new AppError();

      //- Update new Token in UserToken
      await userToken.update({ token: hashedToken });

      //- Option of email
      optionEmail = { email, subject: "Campboy verification", html: htmlSignupVerify(user.id, hashedToken) };
    }
    //+ case : reset-password
    else if (type === RESET_PASSWORD) {
      //- Check email that not verify
      if (!user.verify) throw new AppError("The email address have not verified.", 400);

      //- Create or Update Token in UserToken
      if (userToken) await userToken.update({ token: hashedToken });
      else await db.UserToken.create({ userId: user.id, token: hashedToken });

      //- Option of email
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

///+ Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { userId, hashedToken } = req.params;

    //+ Validation

    //- Check existing of data in UserToken
    const userToken = await db.UserToken.findOne({ where: { userId: userId, token: hashedToken } });
    if (!userToken) throw new AppError("Invalid link for verification", 400);

    //+ Delete data in UserToken and update verify in User
    await db.UserToken.destroy({ where: { userId, token: hashedToken } });
    await db.User.update({ verify: true }, { where: { id: userId, verify: false } });

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};

///+ Verify link for reset password
exports.verifyLink = async (req, res, next) => {
  try {
    const { userId, hashedToken } = req.params;

    //+ Validation

    //- Check existing of data in UserToken
    const userToken = await db.UserToken.findOne({ where: { userId: userId, token: hashedToken } });
    if (!userToken) throw new AppError("Invalid link for verification", 400);

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};

///+ Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, hashedToken } = req.params;
    const { newPassword, confirmPassword } = req.body;

    //+ Validation

    //- New password
    if (!isNotEmpty(newPassword)) throw new AppError("New password is required.", 400);
    if (!isStrongPassword(newPassword))
      throw new AppError(
        "New password must be strong (min length : 8, min lowercase :1, min uppercase : 1, min numbers : 1, min symbols : 1)",
        400
      );

    //- Confirm password
    if (!isNotEmpty(confirmPassword)) throw new AppError("Confirm password is required.", 400);
    if (newPassword !== confirmPassword) throw new AppError("New password and confirm password did not match.", 400);

    //- Check existing of data in UserToken
    const userToken = await db.UserToken.findOne({ where: { userId: userId, token: hashedToken } });
    if (!userToken) throw new AppError("Invalid link for reset password", 400);

    //+ Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    //+ Delete data in UserToken and update password in User
    await userToken.destroy();
    await db.User.update({ password: hashedPassword }, { where: { id: userId, verify: true } });

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
