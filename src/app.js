const express = require("express");
const app = express();
const cors = require("cors");

const mysql = require("mysql2");

app.use(cors());

app.use("/test", async function (req, res, next) {
  const connection = mysql.createConnection({
    host: "aws.connect.psdb.cloud",
    user: "fptip5ql73qe44e43l6x",
    password: "pscale_pw_8v9DVnfXAi2Vy3JrmydKIZLeWhDuvYFXwFCi6Ud93Q2",
    database: "campboy",
    ssl: { rejectUnauthorized: true }
  });

  connection.query("select * from users", (err, results, fields) => console.log(results));
});

app.listen(8000, () => console.log("server is running on port 8000"));
