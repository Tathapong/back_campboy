require("dotenv").config();

const infomationRoute = require("./routes/informationRoute");
const campRoute = require("./routes/campRoute");
const authRoute = require("./routes/authRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const { sequelize, ReviewPost, Camp } = require("./models/index");

// ReviewPost.sync({ alter: true });
// Camp.sync({ alter: true });

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/resources", infomationRoute);
app.use("/camp", campRoute);
app.use("/auth", authRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 8008;
app.listen(port, () => console.log("server running on port " + port));
