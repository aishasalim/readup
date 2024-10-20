// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // Necessary for some hosted databases
  },
});

// Test the database connection
pool
  .connect()
  .then(() => console.log('Connected to the PostgreSQL database'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = pool;
