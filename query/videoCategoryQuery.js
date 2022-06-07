const mysqlCon = require("./base");
const mysqlConnection = require("../connection/mysql");

const table = {
  name: "VIDEO_CATEGORY",
  col: {
    categoryId: "category_id",
    videoId: "video_id",
  },
};

const createVideoCategory = async (videoId, videoCategories) => {
  let params = [];
  await videoCategories.forEach((element) => {
    const temp = Object.keys(element).map((key) => {
      return element[key];
    });
    params.push([temp, videoId]);
  });
  try {
    mysqlCon.beginTransaction();
    const sqlDelete = `DELETE FROM ${table.name} WHERE ${table.col.videoId} = ?`;
    await mysqlConnection.query(sqlDelete, videoId);
    const sql = `INSERT INTO ${table.name} (${table.col.categoryId}, ${table.col.videoId}) VALUES ?`;
    await mysqlConnection.query(sql, [params]);
    mysqlCon.commit();
  } catch (error) {
    mysqlCon.rollback();
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.createVideoCategory = createVideoCategory;
