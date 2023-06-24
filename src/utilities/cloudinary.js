const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (file_path, folder_path, publicId) => {
  try {
    const options = {
      use_filename: false,
      unique_filename: false,
      overwrite: true
    };
    if (folder_path) {
      options.folder = folder_path;
    }

    if (publicId) {
      options.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(file_path, options);
    return result.secure_url;
  } catch (error) {
    throw error;
  }
};

exports.getPublicId = (url, folderPath) => {
  const splitSlash = url.split("/");
  const fileName = splitSlash[splitSlash.length - 1].split(".")[0];
  if (folderPath) return `${folderPath}/${fileName}`;
  else return fileName;
};

exports.resources = (options) => cloudinary.api.resources(options);
exports.deleteResource = async (publicId) => {
  return await cloudinary.api.delete_resources(publicId);
};
