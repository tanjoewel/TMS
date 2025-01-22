const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export function executeQuery(pool, query) {
  const result = pool.query(query, (err, results) => {
    if (err) {
      console.error("Error when querying: ", err.message);
    } else {
      console.log(results);
    }
    pool.end((err) => {
      if (err) {
        console.error("Error closing the connection pool: ", err.message);
        return;
      }
      console.log("Connection pool closed.");
    });
  });
}

const query = "SELECT * FROM accounts";

executeQuery(pool, query);
