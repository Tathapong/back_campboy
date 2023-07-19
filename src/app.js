require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const mysql = require("mysql2/promise");

app.use(cors());

app.use("/test", async function (req, res, next) {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    const [rows, fields] = await connection.execute("select * from users");
    return res.status(200).json({ users: rows });
  } catch (error) {
    console.log(error);
  }
});

app.listen(8000, () => console.log("server is running on port 8000"));
