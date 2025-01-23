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

function executeQuery(query) {
  const result = pool.query(query, (err, results) => {
    if (err) {
      console.error("Error when querying: ", err.message);
    } else {
      console.log(results);
    }

    // closing the connection is causing errors because after the first query the connection is closed and cannot accept any more queries
    // pool.end((err) => {
    //   if (err) {
    //     console.error("Error closing the connection pool: ", err.message);
    //     return;
    //   }
    //   console.log("Connection pool closed.");
    // });
  });
}

module.exports = {
  pool,
  executeQuery,
};
