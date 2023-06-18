require("dotenv").config();

const infomationRoute = require("./routes/informationRoute");
const authRoute = require("./routes/authRoute");
const blogRoute = require("./routes/blogRoute");
const campRoute = require("./routes/campRoute");
const commentRoute = require("./routes/commentRoute");
const profileRoute = require("./routes/profileRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const { sequelize, BlogComment } = require("./models/index");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/resources", infomationRoute);
app.use("/camp", campRoute);
app.use("/auth", authRoute);
app.use("/blog", blogRoute);
app.use("/comment", commentRoute);
app.use("/profile", profileRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 8008;
app.listen(port, () => console.log("server running on port " + port));
