const express = require('express');
const mysql = require('mysql2/promise');
const dbConfig = require("../config/db");
const RondjeController = require("../controllers/rondje_controller");

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Implementing connection pool events
pool.on('acquire', (connection) => {
  console.log(`Connection ${connection.threadId} acquired from the pool`);
});

pool.on('release', (connection) => {
  console.log(`Connection ${connection.threadId} released back to the pool`);
});

// Execute a SQL query using the connection pool
async function executeQuery(res, sqlQuery) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Log when a connection is acquired
    console.log(`Connection ${connection.threadId} acquired from the pool`);

    const [result] = await connection.query(sqlQuery);
    res.json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool

      // Log when a connection is released
      console.log(`Connection ${connection.threadId} released back to the pool`);
    }
  }
}

const router = express.Router();

// GET all Rondje records
router.get("/", async (req, res) => {
  const sqlQuery = 'SELECT * FROM Rondje';
  await executeQuery(res, sqlQuery);
});

// GET Rondje details by ID
router.get('/:id([0-9]+)', async (req, res) => {
  const id = parseInt(req.params.id);
  const sqlQuery = `SELECT * FROM Rondje WHERE Id = ${id}`;
  await executeQuery(res, sqlQuery);
});

// GET Rondje details with specific conditions
router.get('/volgorde', async (req, res) => {
  const sqlQuery = `
      SELECT *
      FROM Rondje
      WHERE Gelopen = 0
      ORDER BY Id, Club
      LIMIT 50;
  `;

  let connection;

  try {
      connection = await pool.getConnection();

      // Log when a connection is acquired
      console.log(`Connection ${connection.threadId} acquired from the pool`);

      const [result] = await connection.query(sqlQuery);

      res.json(result);
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  } finally {
      if (connection) {
          connection.release(); // Release the connection back to the pool

          // Log when a connection is released
          console.log(`Connection ${connection.threadId} released back to the pool`);
      }
  }
});



// GET Rondje details with specific conditions
router.get('/snelste', async (req, res) => {
  const sqlQuery = `
    SELECT *
    FROM Rondje
    WHERE (Club, Gelopen) IN (
      SELECT Club, MIN(Gelopen) AS Gelopen
      FROM Rondje
      WHERE Gelopen = 1
      GROUP BY Club
    )
    ORDER BY Time
    LIMIT 5
  `;

  try {
    connection = await pool.getConnection();

    // Log when a connection is acquired
    console.log(`Connection ${connection.threadId} acquired from the pool`);

    const [result] = await connection.query(sqlQuery);

    res.json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool

      // Log when a connection is released
      console.log(`Connection ${connection.threadId} released back to the pool`);
    }
  }
});


// Other RondjeController routes
router.post("/create", RondjeController.create);
router.put("/update/:id", RondjeController.update);
router.delete("/delete/:id", RondjeController.delete);

module.exports = router;
