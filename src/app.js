require("dotenv").config();

const authRoute = require("./routes/authRoute");
const blogRoute = require("./routes/blogRoute");
const campRoute = require("./routes/campRoute");
const commentRoute = require("./routes/commentRoute");
const homeRoute = require("./routes/homeRoute");
const infomationRoute = require("./routes/informationRoute");
const profileRoute = require("./routes/profileRoute");
const joincampRoute = require("./routes/joincampRoute");

const errorMiddleware = require("./middlewares/errorMiddleware");

// const { sequelize } = require("./models/index");
// sequelize.sync()

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/resources", infomationRoute);

app.use("/auth", authRoute);
app.use("/blog", blogRoute);
app.use("/camp", campRoute);
app.use("/comment", commentRoute);
app.use("/home", homeRoute);
app.use("/profile", profileRoute);
app.use("/joincamp", joincampRoute);

app.use(errorMiddleware);

const port = process.env.PORT || 8008;
app.listen(port, () => console.log("server running on port " + port));
