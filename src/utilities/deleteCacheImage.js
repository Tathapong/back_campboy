const fs = require("fs");

module.exports = function deleteCacheImage(imageFileList) {
  try {
    if (imageFileList.length) {
      imageFileList.forEach((item) => {
        fs.unlinkSync(item.path);
      });
    }
  } catch (error) {
    console.log(error);
  }
};
