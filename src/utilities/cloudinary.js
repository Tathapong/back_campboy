const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (file_path, folder_path, publicId) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder: folder_path
  };

  if (publicId) {
    options.public_id = publicId;
  }

  try {
    const result = await cloudinary.uploader.upload(file_path, options);
    return result.secure_url;
  } catch (error) {
    console.log(error);
  }
};

exports.getPublicId = (url) => {
  const splitSlash = url.split("/");
  return splitSlash[splitSlash.length - 1].split(".")[0];
};

exports.resources = (options) => cloudinary.api.resources(options);
