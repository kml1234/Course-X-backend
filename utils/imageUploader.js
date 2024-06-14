const cloudinary = require("cloudinary").v2;

// upload image to cloudinary
exports.uploadImage = async (file, folder, height, qulaity) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (qulaity) {
    options.quality = qulaity;
  }
  options.resource_type = "auto";
  //console.log("done");
  //return await cloudinary.uploader.upload(file.tempFilePath, options);
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    console.log("Upload successful:");
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:");
    console.error(error);
    throw error;
  }
};
