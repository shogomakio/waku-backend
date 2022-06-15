const mysqlConnection = require("../connection/mysql");

const { table } = require("./config");

module.exports.beginTransaction = function beginTransaction() {
  mysqlConnection.beginTransaction();
};

module.exports.commit = function commit() {
  mysqlConnection.commit();
};

module.exports.rollback = function rollback() {
  mysqlConnection.rollback();
};

const createVideo = async (videoDataList) => {
  const sql =
    "INSERT INTO VIDEO (title, folder, filename, full_path, thumbnail, part) VALUES ?";
  let params = [];
  videoDataList.forEach((element) => {
    const result = Object.keys(element).map((key) => {
      return element[key];
    });
    params.push(result);
  });
  try {
    this.beginTransaction();
    await mysqlConnection.query(sql, [params]);
    this.commit();
  } catch (error) {
    this.rollback();
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.createVideo = createVideo;

async function existTitle({ title }) {
  const sql = `SELECT COUNT(ID) AS count FROM VIDEO WHERE TITLE=?`;
  try {
    const result = await mysqlConnection.query(sql, title);
    if (result[0]["count"] > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
}
module.exports.existTitle = existTitle;

module.exports.findVideo = async (folder, filename) => {
  const sql = `SELECT * FROM VIDEO WHERE full_path = ? AND FILENAME = ?`;
  try {
    const result = await mysqlConnection.query(sql, [folder, filename]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.findVideoById = async (id) => {
  const sql = `SELECT * FROM VIDEO WHERE id = ?`;
  try {
    const result = await mysqlConnection.query(sql, [id]);
    return result[0] ?? null;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

const getAllVideos = async () => {
  const sql = `SELECT * FROM VIDEO ORDER BY TITLE`;
  try {
    return await mysqlConnection.query(sql);
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.getAllVideos = getAllVideos;

async function existThumbnail({ thumbnail }) {
  const sql = `SELECT COUNT(ID) AS count FROM VIDEO WHERE thumbnail=?`;
  try {
    const result = await mysqlConnection.query(sql, thumbnail);
    if (result[0]["count"] > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
}
module.exports.existThumbnail = existThumbnail;

module.exports.updateThumbnail = ({ id, thumbnail }) => {
  const sql = "UPDATE VIDEO SET thumbnail = ? WHERE ID = ?";
  try {
    mysqlConnection.query(sql, [thumbnail, id]);
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.getVideos = async (limit, page) => {
  const offset = (page - 1) * limit;
  const sql = `SELECT * FROM ${table.video.name} ORDER BY ${table.video.col.title} LIMIT ${limit} OFFSET ${offset}`;
  try {
    return await mysqlConnection.query(sql);
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.getVideoCount = async () => {
  const sql = `SELECT COUNT(id) as count FROM VIDEO`;
  try {
    const result = await mysqlConnection.query(sql);
    return result[0]["count"];
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.updateVideoView = (id) => {
  const sql = `UPDATE VIDEO SET view_count = view_count + 1 WHERE id = ?`;
  try {
    mysqlConnection.query(sql, id);
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.updateVideo = async (id, video) => {
  const sql =
    "UPDATE VIDEO SET code = ?, title = ?, folder = ?, filename = ?, full_path = ?, thumbnail = ?, part = ?, year = ? WHERE ID = ?";
  try {
    await mysqlConnection.query(sql, [
      video.code,
      video.title,
      video.folder,
      video.filename,
      video.full_path,
      video.thumbnail,
      video.part,
      video.year,
      id,
    ]);
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.searchByText = (text) => {
  const search = `%${text}%`;
  const sql = "SELECT * FROM VIDEO WHERE TITLE LIKE ? ORDER BY TITLE";
  try {
    const result = mysqlConnection.query(sql, [search]);
    return result;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.searchByCategory = (searchTerm, categories = null) => {
  const titleSearch = `"%${searchTerm}%"`;

  let sql =
    `SELECT ${table.video.col.id},` +
    ` ${table.video.col.code},` +
    ` ${table.video.col.title},` +
    ` ${table.video.col.folder},` +
    ` ${table.video.col.filename},` +
    ` ${table.video.col.full_path},` +
    ` ${table.video.col.thumbnail},` +
    ` ${table.video.col.part},` +
    ` ${table.video.col.favorite},` +
    ` ${table.video.col.year}` +
    ` FROM ${table.video.name} WHERE TITLE LIKE ${titleSearch}`;

  if (categories) {
    const categoriesSplitted = categories.split(",");
    const subQuery =
      ` AND ${table.video.col.id} IN (` +
      ` SELECT ${table.videoCategory.col.videoId} FROM ${table.videoCategory.name}` +
      ` WHERE ${table.videoCategory.col.categoryId} IN (${categories})` +
      ` GROUP BY ${table.videoCategory.col.videoId}` +
      ` HAVING COUNT(DISTINCT ${table.videoCategory.col.categoryId}) = ${categoriesSplitted.length})`;
    sql += subQuery;
  }
  sql += ` ORDER BY ${table.video.col.title} LIMIT ${table.limit}`;
  try {
    const result = mysqlConnection.query(sql, titleSearch);
    return result;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.updateFavorite = (id) => {
  const sql = "UPDATE VIDEO SET favorite = NOT favorite WHERE ID = ?";
  try {
    mysqlConnection.query(sql, id);
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.getCategories = () => {
  const sql = "SELECT * FROM CATEGORY ORDER BY CATEGORY";
  try {
    const result = mysqlConnection.query(sql);
    return result;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};

module.exports.getVideoCategories = (id) => {
  const sql =
    "select vc.id, vc.category_id, vc.video_id, c.category as category_name from video_category as vc left join category as c on vc.category_id = c.id WHERE vc.video_id = ? ORDER BY CATEGORY";
  try {
    const result = mysqlConnection.query(sql, id);
    return result;
  } catch (error) {
    console.log("SQL VIDEO ERROR:", error);
  }
};
