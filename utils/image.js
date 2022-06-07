const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
ffmpeg.setFfprobePath(ffprobePath);

function deleteThumbnail(fullPathFile) {
  // Remove if thumbnail already exists
  fs.unlink(fullPathFile, (err) => {
    if (err) {
      console.log("Couldn't remove thumbnail:", thumbnail);
    }
  });
}

async function createThumbnail(fullPathFile, folder, thumbnailName) {
  await new Promise((resolve, reject) => {
    ffmpeg(fullPathFile)
      .on("filenames", (filenames) => {
        console.log("Will generate " + filenames.join(", "));
      })
      // .on("end", function () {
      //   // videoQuery.updateThumbnail({
      //   //   id: videoId,
      //   //   thumbnail: `${thumbnailName}.png`,
      //   // });
      //   console.log("Thumbnail completed:", count);
      // })
      .on("error", (err) => {
        console.error(err.message);
        return reject(Error(err));
        // console.log("error");
      })
      .screenshot({
        count: 1,
        folder,
        filename: thumbnailName,
        // filename: `${thumbnailName}-${part}`,
        timestamps: ["60"],
      });
    resolve();
  });
}

module.exports.createThumbnail = createThumbnail;
