//+ create JSON file (imageCamp)
// const imageData = require("../cloudinary.json");
// const fs = require("fs");

// const length = imageData.datas.length;
// const res = [];

// for (let i = 0; i < length; i++) {
//   const image = imageData.datas[i].secure_url;
//   const publicId = imageData.datas[i].public_id;

//   const type = publicId.endsWith("no_1") ? "COVER" : "IMAGE";
//   const splitLength = publicId.split("/").length;

//   const campId = +publicId.split("/")[splitLength - 2];

//   const data = { image, type, camp_id: campId };
//   res.push(data);
// }

// fs.writeFileSync("imageCamp.json", JSON.stringify({ datas: res }));

//+ Upload to Database
// const data = require("./assets/data/imageCamp.json");
// const { CampImage, Camp } = require("./models/index");

// async function insetDatabase() {
// await Camp.create({
//   name: "หัวแหลม แคมป์ปิ้ง แก่งกระจาน HuaLaem Camping",
//   locationLat: 12.947977,
//   locationLng: 99.598352,
//   overview: "test",
//   ProvinceId: 54
// created_at: new Date(),
// updated_at: new Date()
// });
// await CampImage.bulkCreate(data.datas);
// }

// insetDatabase();
