const mysqlConnection = require("../connection/mysql");

module.exports.beginTransaction = function beginTransaction() {
  mysqlConnection.beginTransaction();
};

module.exports.commit = function commit() {
  mysqlConnection.commit();
};

module.exports.rollback = function rollback() {
  mysqlConnection.rollback();
};
