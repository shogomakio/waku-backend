const videoCategoryQuery = require("../query/videoCategoryQuery");
const videoQuery = require("../query/videoQuery");
const { path } = require("../utils/config");
const utilsFile = require("../utils/file");
const imageUtil = require("../utils/image");

class VideoLogic {}

module.exports.VideoLogic = VideoLogic;

module.exports.createVideosInfo = async () => {
  const directories = await utilsFile.loadDirectory(path.src);
  await utilsFile.cleanGarbageFiles(directories);
  const videoList = await utilsFile.buildVideosInfo(directories);

  if (videoList.length > 0) {
    await videoQuery.createVideo(videoList);
    console.log("saved videos to the DB");
    for (const video of videoList) {
      const fullPathFile = `${video.full_path}/${video.filename}`;
      const thumbnailName = video.thumbnail.substring(
        0,
        video.thumbnail.lastIndexOf(".")
      );
      await imageUtil.createThumbnail(
        fullPathFile,
        video.full_path,
        thumbnailName
      );
      console.log("thumbnails created.");
    }
  }
};

module.exports.updateVideo = async (video, categories = null) => {
  const id = video.id;
  try {
    videoQuery.beginTransaction();
    const oldVideo = await videoQuery.findVideoById(id);
    await videoQuery.updateVideo(id, video);
    const oldFullPathFile = `${oldVideo.full_path}/${oldVideo.filename}`;
    const newFullPathFile = `${video.full_path}/${video.filename}`;
    if (oldFullPathFile !== newFullPathFile) {
      // move file
      utilsFile.renameFile({
        oldPath: oldVideo.full_path,
        oldFilename: oldVideo.filename,
        newPath: video.full_path,
        newFilename: video.filename,
      });
      // move thumbnail
      utilsFile.renameFile({
        oldPath: oldVideo.full_path,
        oldFilename: oldVideo.thumbnail,
        newPath: video.full_path,
        newFilename: video.thumbnail,
      });
    }
    if (!categories) {
      return;
    }
    videoCategoryQuery.createVideoCategory(video.id, categories);
    // videoQuery.commit();
  } catch (err) {
    // videoQuery.rollback();
    console.log(`ERROR trying to UPDATE Video id:${id}`, err);
  }
};

module.exports.generateThumbnailByVideo = (video, timestamps = null) => {
  try {
    utilsFile.generateThumbnailByVideo(video, timestamps);
  } catch (err) {
    console.log(`ERROR trying to UPDATE Video id:${video.id}`, err);
  }
};

module.exports.refreshThumbnails = async () => {
  const directories = await utilsFile.loadDirectory(path.src);
  utilsFile.refreshThumbnails(directories);
};

module.exports.cleanGarbageFiles = async () => {
  const directories = await utilsFile.loadDirectory(path.src);
  await utilsFile.cleanGarbageFiles(directories);
  const endTime = new Date().getTime();
  console.log("garbage files deleted");
  console.log("time exceeded in sec:", (endTime - startTime) / 1000);
};

module.exports.searchByText = async (text) => {
  try {
    const result = await videoQuery.searchByText(text);
    return result;
  } catch (error) {
    console.log(`ERROR trying to search Video by :${text}`, err);
  }
};

module.exports.searchByCategory = async (searchTerm, categories = null) => {
  try {
    const result = await videoQuery.searchByCategory(searchTerm, categories);
    return result;
  } catch (error) {
    console.log(`ERROR trying to search Video by :${searchTerm}`, error);
  }
};

module.exports.updateFavorite = async (id) => {
  videoQuery.updateFavorite(id);
};

module.exports.getCategories = async () => {
  try {
    const result = await videoQuery.getCategories();
    return result;
  } catch (error) {
    console.log(`ERROR trying to get Categories:`, err);
  }
};

module.exports.getVideoCategories = async (id) => {
  try {
    const result = await videoQuery.getVideoCategories(id);
    return result;
  } catch (error) {
    console.log(`ERROR trying to get Categories:`, error);
  }
};
