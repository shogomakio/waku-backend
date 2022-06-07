require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

module.exports = {
  port: process.env.PORT,
  mysqlConfig: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  },
  path: {
    src: process.env.SRC,
    src_idol: process.env.SRC_IDOL,
  }
};
