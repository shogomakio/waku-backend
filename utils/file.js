const glob = require("glob-promise");
const fs = require("fs");
const videoQuery = require("../query/videoQuery");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const imageUtil = require("./image");
ffmpeg.setFfmpegPath(ffmpegPath);
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
ffmpeg.setFfprobePath(ffprobePath);

/**
 * delete files that are not video nor image files
 * @param {array} directories array of files
 */
module.exports.cleanGarbageFiles = async (directories) => {
  for (const file of directories) {
    const extension = file.split(".").pop();
    switch (extension) {
      case "txt":
      case "mht":
      case "url":
      case "nfo":
      case "png":
        fs.unlink(file, (err) => {
          if (err) {
            throw err;
          }
        });
        break;
      default:
        // console.log(extension);
        break;
    }
  }
  console.log("Directory cleaned.");
};

/**
 * Load all files from path
 * @param {string} src directory path of files to load
 * @returns
 */
const loadDirectory = async (src) => {
  // glob library is use to load directories and subdirectories without additional logic.
  return await glob.promise(src + "/**/*").then((contents) => {
    console.log("Directory loaded completed");
    return contents;
  });
};
module.exports.loadDirectory = loadDirectory;

function removeExtension(filename) {
  return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

/**
 * Build a list of the videos and their information
 * @param {Array} directories
 * @returns video list
 */
async function buildVideosInfo(directories) {
  let count = 0;
  const videoList = [];
  for (const fullPathFile of directories) {
    // if (count > 100) {
    //   break;
    // }
    // count++;
    const isVideo = hasVideoExtension(fullPathFile);
    if (isVideo === false) {
      // skip because this is not a video file
      continue;
    }
    const pathDirectory = fullPathFile.split("/");
    const filename = pathDirectory.pop();
    const title = removeExtension(filename);
    const existVideo = await videoQuery.existTitle({
      title,
    });
    if (existVideo) {
      continue;
    }
    const folderPath = pathDirectory.join("/");
    const temp_path = pathDirectory.splice(2);
    const folder = temp_path.join("/");
    const part = getNextPart(videoList, title);
    const thumbnailName = `thumb-${title}-${part}`;
    videoList.push({
      title,
      folder,
      filename,
      full_path: folderPath,
      thumbnail: `${thumbnailName}.png`,
      part,
    });
    count++;
    // imageUtil.createThumbnail(fullPathFile, folder, thumbnailName);
  }
  return videoList;
}

module.exports.buildVideosInfo = buildVideosInfo;

/**
 * Get the next video part
 * @param {*} videoList
 * @param {*} title
 * @returns
 */
function getNextPart(videoList, title) {
  let videoPart;
  const reversedVideoList = videoList.reverse();
  videoPart = reversedVideoList.find((video) => video.title === title);
  const result = isNaN(videoPart?.part) ? 1 : videoPart.part + 1;
  return result;
}

module.exports.refreshThumbnails = async (directories) => {
  let count = 0;
  for (const fullPathFile of directories) {
    // if (count > 250) {
    //   break;
    // }
    count++;
    const isVideo = hasVideoExtension(fullPathFile);
    if (isVideo === false) {
      // skip because this is not a video file
      continue;
    }
    const files = fullPathFile.split("/");
    // const title = files[files.length - 2];
    // const existVideo = await videoQuery.existTitle({
    //   title,
    // });
    // if (existVideo === false) {
    //   // skip if the video doesn't exist in DB
    //   continue;
    // }
    const filename = files.pop();
    // const thumbnailName = `thumb-${filename}`;
    // const thumbnailName = `thumb-${title}`;
    // const thumbnailName = `thumb-${path.parse(filename).name}`;
    const thumbnailName = `${thumbnailName}-${video.part}`;
    const folder = files.join("/");
    // const existThumbnail = await existFile(fullPath, thumbnailName);
    // if (existThumbnail) {
    //   // skip if thumbnail already exists
    //   // continue;
    //   // Remove if thumbnail already exists
    //   fs.unlink([fullPath, thumbnailName].join("/"), (err) => {
    //     if (err) {
    //       console.log("Couldn't remove thumbnail:", thumbnailName);
    //     }
    //   });
    // }
    const video = await videoQuery.findVideo(folder, filename);
    if (!video) {
      continue;
    }
    // imageUtil.createThumbnail(fullPathFile, folder, thumbnailName);
    ffmpeg(fullPathFile)
      // .on("filenames", function (filenames) {
      //   console.log("Will generate " + filenames.join(", "));
      // })
      .on("end", function () {
        videoQuery.updateThumbnail({
          id: video.id,
          thumbnail: `${thumbnailName}.png`,
        });
        console.log("Thumbnail completed:", video.id);
      })
      .on("error", (err) => {
        console.error(err);
        // console.log("error");
      })
      .screenshot({
        count: 1,
        folder: folder,
        filename: thumbnailName,
        timestamps: ["60"],
      });
  }
};

async function existFile(folder, filename) {
  const files = await loadDirectory(folder);
  for (const file of files) {
    const dir = file.split("/");
    const tempFileName = dir.pop();
    if (tempFileName === filename) {
      return true;
    }
    if (tempFileName === `${filename}.png`) {
      return true;
    }
  }
  return false;
}

module.exports.generateThumbnailByVideo = async (video, timestamps = "4%") => {
  const thumbnailFullPath = [video.full_path, video.thumbnail].join("/");
  if (fs.existsSync(thumbnailFullPath)) {
    deleteThumbnail(video.full_path, video.thumbnail);
  }
  const directory = [video.full_path, video.filename].join("/");
  // imageUtil.createThumbnail(directory, video.full_path, video.thumbnail);
  ffmpeg(directory)
    .on("end", function () {
      videoQuery.updateThumbnail({
        id: video.id,
        thumbnail: video.thumbnail,
      });
      console.log("Thumbnail completed:", video.id);
    })
    .on("error", (err) => {
      console.error(err);
    })
    .screenshot({
      count: 1,
      folder: video.full_path,
      filename: video.thumbnail,
      timestamps: [timestamps],
    });
};

module.exports.renameFile = ({
  oldPath,
  oldFilename,
  newPath,
  newFilename,
}) => {
  if (fs.existsSync(newPath) === false) {
    // create new directory
    fs.mkdirSync(newPath, { recursive: true });
  }
  const oldFullPathFile = `${oldPath}/${oldFilename}`;
  const newFullPathFile = `${newPath}/${newFilename}`;
  // moved file
  fs.renameSync(oldFullPathFile, newFullPathFile, (err) => {
    if (err) {
      throw err;
    }
    console.log("File moved successfully");
  });
};

function hasVideoExtension(fileName) {
  const extension = path.parse(fileName).ext;
  switch (extension) {
    case ".webm":
    case ".mkv":
    case ".flv":
    case ".vob":
    case ".ogv":
    case ".ogg":
    case ".rrc":
    case ".gifv":
    case ".mng":
    case ".mov":
    case ".avi":
    case ".qt":
    case ".wmv":
    case ".yuv":
    case ".rm":
    case ".asf":
    case ".amv":
    case ".mp4":
    case ".m4p":
    case ".m4v":
    case ".mpg":
    case ".mp2":
    case ".mpeg":
    case ".mpe":
    case ".mpv":
    case ".m4v":
    case ".svi":
    case ".3gp":
    case ".3g2":
    case ".mxf":
    case ".roq":
    case ".nsv":
    case ".flv":
    case ".f4v":
    case ".f4p":
    case ".f4a":
    case ".f4b":
    case ".mod":
      return true;
    default:
      return false;
  }
}

function deleteThumbnail(fullPath, thumbnail) {
  // Remove if thumbnail already exists
  fs.unlink([fullPath, thumbnail].join("/"), (err) => {
    if (err) {
      console.log("Couldn't remove thumbnail:", thumbnail);
    }
  });
}
