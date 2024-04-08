// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const dbConfig = require("../config/db");
const router = express.Router();

const lidController = require("../controllers/lid_controller");

async function executeQuery(res, sqlQuery) {
  let connection;

  try {
    connection = await pool.getConnection(); // Use the existing pool

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

// Implementing connection pool events
const pool = mysql.createPool(dbConfig);
pool.on('acquire', (connection) => {
  console.log(`Connection ${connection.threadId} acquired from the pool`);
});
pool.on('release', (connection) => {
  console.log(`Connection ${connection.threadId} released back to the pool`);
});

router.get("/", async (req, res) => {
  const sqlQuery = 'SELECT * FROM Lid';
  await executeQuery(res, sqlQuery);
});

// API endpoint to get lid details by ID
router.get('/:id([0-9]+)', async (req, res) => {
  const id = parseInt(req.params.id);
  const sqlQuery = 'SELECT * FROM Lid WHERE Id = ' + id;
  await executeQuery(res, sqlQuery);
});

router.post("/create", lidController.create);
router.put("/update/:id", lidController.update);
router.delete("/delete/:id", lidController.delete);

module.exports = router;
