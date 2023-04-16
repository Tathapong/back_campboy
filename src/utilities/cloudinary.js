const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (imagePath, folderPath, publicId) => {
  const options = {
    folder: folderPath,
    use_filename: true,
    unique_filename: false,
    overwrite: true
  };

  if (publicId) {
    options.public_id = publicId;
  }

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result.secure_url;
  } catch (err) {
    console.log(err);
  }
};

exports.getPublicId = (url) => {
  const splitSlash = url.split("/");
  return splitSlash[splitSlash.length - 1].split(".")[0];
};

exports.resources = (options) => cloudinary.api.resources(options);
