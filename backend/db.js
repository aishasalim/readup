// // db.js
// const { Pool } = require('pg');

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false, // Necessary for some hosted databases
//   },
// });

// // Test the database connection
// pool
//   .connect()
//   .then(() => console.log('Connected to the PostgreSQL database'))
//   .catch((err) => console.error('Connection error', err.stack));

// module.exports = pool;

const { Pool } = require("pg");

// Use the DATABASE_URL environment variable provided by Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessary for hosted databases with SSL
  },
});

// Test the database connection
pool
  .connect()
  .then(() => console.log("Connected to the PostgreSQL database"))
  .catch((err) => console.error("Connection error", err.stack));

module.exports = pool;
