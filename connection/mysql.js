const mysql = require("mysql");
const { mysqlConfig } = require("../utils/config");

const connection = mysql.createConnection({
  host: mysqlConfig.host,
  user: mysqlConfig.user,
  password: mysqlConfig.password,
  database: mysqlConfig.database,
});

const beginTransaction = () => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    const query = connection.query(sql, params, (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(results, fields);
      }
    });
    console.debug("QUERY: [%s]", query.sql);
  });
};

const commit = () => {
  return new Promise((resolve, reject) => {
    connection.commit((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

const rollback = (err) => {
  return new Promise((resolve, reject) => {
    connection.rollback(() => {
      reject(err);
    });
  });
};

module.exports = {
  beginTransaction,
  query,
  commit,
  rollback,
};
