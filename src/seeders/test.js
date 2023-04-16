const cloudinary = require("./utilities/cloudinary");
const fs = require("fs");

cloudinary.resources({ type: "upload", max_results: 500, prefix: "Campboy/informationItem/" }).then((res) => {
  const list = res.resources;
  const data = list.map((item) => {
    const type = item.public_id.split("/")[item.public_id.split("/").length - 2].toUpperCase();
    const title = item.public_id.split("/")[item.public_id.split("/").length - 1];
    const icon_image = item.secure_url;
    return {
      type: type,
      title: title,
      iconImage: icon_image
    };
  });
  fs.writeFileSync("informationItem.json", JSON.stringify(data));
});
