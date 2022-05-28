require("dotenv").config();
const { Client } = require("pg");
const isProduction = process.env.NODE_ENV === "production";
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
console.log(connectionString);
const client = new Client({
  connectionString : connectionString,
  ssl: { rejectUnauthorized: false } ,
});
module.exports = { client };
