require("dotenv").config();
const nodemailer = require("nodemailer");

exports.sendEmail = async ({ email, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });

    const emailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: subject,
      html: html ? html : "",
      text: text ? text : ""
    };

    await transporter.sendMail(emailOptions);
    console.log("Email have sent completely");
  } catch (error) {
    throw error;
  }
};

exports.htmlSignupVerify = (userId, token) =>
  '<div style="text-align:center; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' +
  "<h1>Please verify your email</h1>" +
  "<div>To continue using Campboy, please verify your email as below button</div>" +
  `<a href="${process.env.MY_IP}:3000/users/${userId}/verify/${token}">Verify email</a>` +
  "</div>";

exports.htmlResetPassword = (userId, token) =>
  '<div style="text-align:center; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' +
  "<h1>Password reset</h1>" +
  "<div>If you've lost your password or wish to reset it, use the link below to get started.</div>" +
  `<a href="${process.env.MY_IP}:3000/users/${userId}/reset-password/${token}">Verify email</a>` +
  "</div>";
