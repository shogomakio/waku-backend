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

module.exports.getCategories = () => {
  const sql = `SELECT * FROM ${table.category.name} ORDER BY ${table.category.col.category} ASC`;
  try {
    const result = mysqlConnection.query(sql);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports.existCategory = async (category) => {
  const sql = `SELECT ${table.category.col.id} FROM ${table.category.name} WHERE ${table.category.col.category}=?`;
  try {
    const result = await mysqlConnection.query(sql, category);
    return result[0]?.[table.category.col.id] && result[0]?.[table.category.col.id] > 0;
  } catch (error) {
    throw error;
  }
};

module.exports.createCategory = (category) => {
  const sql = `INSERT INTO ${table.category.name} (${table.category.col.category}) VALUES (?)`;
  try {
    const result = mysqlConnection.query(sql, category);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports.updateCategory = (id, category) => {
  const sql = `UPDATE ${table.category.name} SET ${table.category.col.category} = ? WHERE ${table.category.col.id} = ?`;
  try {
    const result = mysqlConnection.query(sql, [category, id]);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports.deleteCategory = (id) => {
  const sql = `DELETE FROM ${table.category.name} WHERE ${table.category.col.id} = ?`;
  try {
    const result = mysqlConnection.query(sql, id);
    return result;
  } catch (error) {
    throw error;
  }
};
