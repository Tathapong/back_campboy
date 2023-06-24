const fs = require("fs");

module.exports = function deleteCacheImage(imageFileList) {
  if (imageFileList.length) {
    imageFileList.forEach((item) => {
      fs.unlinkSync(item.path);
    });
  }
};
