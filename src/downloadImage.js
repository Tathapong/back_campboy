const camp = require("./assets/data/sample.json");

const axios = require("axios");
const fs = require("fs");

async function getImage(url, path) {
  axios({
    method: "get",
    url: url,
    responseType: "stream"
  })
    .then((res) => {
      res.data.pipe(fs.createWriteStream(path));
    })
    .catch((err) => {
      console.log(err);
    });
}
//+ download information image from src
// const rule = require("./assets/data/rule.json");
// const rule = require("./assets/data/rule.json");
const rule = require("./assets/data/rule.json");

for (let i = 0; i < rule.length; i++) {
  const url = rule[i].icon_image;
  const fileName = rule[i].title.split(" ").join("_");
  const path = "./assets/informationItem/rule/" + fileName + ".jpg";

  const test = async () => {
    await getImage(url, path);
  };
  test();
}
