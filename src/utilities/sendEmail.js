require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// exports.sendEmail = async ({ email, subject, text, html }) => {
//   try {
//     const oauth2Client = new OAuth2(
//       process.env.CLIENT_ID,
//       process.env.CLIENT_SECRET,
//       "https://developers.google.com/oauthplayground"
//     );

//     oauth2Client.setCredentials({
//       refresh_token: process.env.REFRESH_TOKEN
//     });

//     const accessToken = await oauth2Client.getAccessToken();
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAUTH2",
//         user: process.env.EMAIL,
//         accessToken: accessToken,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN
//       }
//     });

//     const emailOptions = {
//       to: email,
//       from: process.env.EMAIL,
//       subject: subject,
//       html: html ? html : "",
//       text: text ? text : ""
//     };

//     await transporter.sendMail(emailOptions);
//     console.log("Email have sent completely");
//   } catch (error) {
//     console.log(error);
//   }
// };

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
    console.log(error);
  }
};

exports.htmlSignupVerify = (userId, token) => {
  const html =
    '<div style="text-align:center; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' +
    "<h1>Please verify your email</h1>" +
    "<div>To continue using Campboy, please verify your email as below button</div>" +
    `<a href="${process.env.MY_IP}:3000/users/${userId}/verify/${token}">Verify email</a>` +
    "</div>";

  return html;
};

exports.htmlResetPassword = (userId, token) => {
  const html =
    '<div style="text-align:center; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' +
    "<h1>Password reset</h1>" +
    "<div>If you've lost your password or wish to reset it, use the link below to get started.</div>" +
    `<a href="${process.env.MY_IP}:3000/users/${userId}/reset-password/${token}">Verify email</a>` +
    "</div>";

  return html;
};
