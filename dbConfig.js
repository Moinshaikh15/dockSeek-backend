const Pool = require("pg-pool");
const dotenv = require("dotenv");
const { response } = require("express");
dotenv.config();
let databaseConfig = { connectionString: process.env.URL };
let dbPool = new Pool(databaseConfig);
// let dbPool = new Pool({
//   user: "postgres",
//   host: "127.0.0.1",
//   database: "dock",
//   password: "Moin@2001",
//   port: 5432,
// });

module.exports = dbPool;
