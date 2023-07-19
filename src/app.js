const express = require("express");
const app = express();
const cors = require("cors");

const mysql = require("mysql2/promise");

app.use(cors());

app.use("/test", async function (req, res, next) {
  const connection = await mysql.createConnection({
    host: "aws.connect.psdb.cloud",
    user: "z91u5hfvp46fkar8vvs9",
    password: "pscale_pw_tNnXAr72Q0T9ELOoTym0zbxIwKVt0bP1XZrbUyqwQ3F",
    database: "campboy",
    ssl: { rejectUnauthorized: true }
  });

  const [rows, fields] = await connection.execute("select * from users");
  return res.status(200).json({ users: rows });
});

app.listen(8000, () => console.log("server is running on port 8000"));
