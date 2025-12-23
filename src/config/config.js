require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "superapp_db",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql"
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME + "_test" || "superapp_db_test",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME + "_prod" || "superapp_db_prod",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql"
  }
}; 