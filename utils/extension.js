const getFileExtension = async (files) => {
  return file.split(".").pop();
};

module.exports.getFileExtension = getFileExtension;
