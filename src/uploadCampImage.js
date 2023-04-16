const fs = require("fs");
const { setTimeout } = require("timers/promises");

const cloudinary = require("./utilities/cloudinary");

//+ CampImage
// const folder = fs.readdirSync("./assets/imageCamp");

// async function upload() {
//   for (let i = 0; i < folder.length; i++) {
//     const folderName = i + 1;
//     const file = fs.readdirSync(`./assets/imageCamp/${folderName}`);
//     for (let j = 0; j < file.length; j++) {
//       const cloudinary_folder = "/Campboy/imageCamp/" + folderName;
//       const fileName = file[j];

//       const cloudinary_filename = `./assets/imageCamp/${folderName}/${fileName}`;
//       const public_id = cloudinary.getPublicId(cloudinary_filename);

//       async function test() {
//         cloudinary
//           .uploadImage(cloudinary_filename, cloudinary_folder, public_id)
//           .then((res) => {
//             console.log("done");
//           })
//           .catch((err) => console.log(`${i + 1}_${j + 1}_fail`));
//       }

//       await setTimeout(50, test());
//     }
//   }
// }
// upload();

//+ informationItem
// const folder = fs.readdirSync("./src/assets/informationItem/rule");

// async function upload() {
//   for (let i = 0; i < folder.length; i++) {
//     const imagePath = "./src/assets/informationItem/rule/" + folder[i];
//     const folderPath = "/Campboy/informationItem/rule";
//     const public_id = folder[i].split(".")[0];

//     function test() {
//       cloudinary
//         .uploadImage(imagePath, folderPath, public_id)
//         .then((res) => console.log("done"))
//         .catch((err) => console.log(err));
//     }
//     await setTimeout(50, test());
//   }
// }

// upload();
