const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "Leen2025",
  database: process.env.DB_NAME     || "degreemap_db",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;