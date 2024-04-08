const mysql = require('mysql2/promise');
const dbConfig = require("../config/db");
const jwt = require('jsonwebtoken');

const key = process.env.JWT_SECRET;

const lidController = {
  readAll: () => {
    // Placeholder for readAll implementation
  },

  create: async (req, res) => {
    try {
      // Validate required fields
      const requiredFields = ['naam', 'club'];
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
      }

      // Check for existing naam and club to prevent duplicates
      const naam = req.body.naam;
      const club = req.body.club;
      const emailCheckQuery = 'SELECT EXISTS(SELECT 1 FROM Lid WHERE naam = ? AND club = ?) AS lidExists';

      const connection = await mysql.createConnection(dbConfig);

      // Execute the emailCheckQuery
      const [emailResult] = await connection.query(emailCheckQuery, [naam, club]);

      if (emailResult[0].lidExists) {
        return res.status(409).json({ error: 'Lid already exists with the provided naam and club' });
      }

      // Prepare the insertion query
      const data = {
        naam: req.body.naam,
        club: req.body.club,
      };
      const sqlQuery = 'INSERT INTO Lid SET ?';

      // Execute the insertion query
      const [result] = await connection.query(sqlQuery, data);

      if (result.affectedRows === 1) {
        const createdLidId = result.insertId;

        const token = jwt.sign({ userId: createdLidId }, key, { expiresIn: '24h' });

        res.cookie("web3_token", token, {
          httpOnly: true,
          secure: false,
          expires: new Date(Date.now() + 1 * 60 * 60 * 10000),
        });
        res.status(201).json({ message: `Lid created successfully with ID: ${createdLidId}` });
      } else {
        throw new Error('Insertion failed with unexpected result');
      }
    } catch (error) {
      console.error('Error creating lid:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  update: async (req, res) => {
    const lidId = req.params.id; // Extract ID from request parameters

    const data = {
      naam: req.body.naam,
      club: req.body.club,
    };

    const sqlQuery = `UPDATE Lid SET ? WHERE id = ?`;

    try {
      const connection = await mysql.createConnection(dbConfig);

      const [result] = await connection.query(sqlQuery, [data, lidId]);

      if (result.affectedRows === 1) {
        res.status(200).json({ message: `Lid updated successfully` });
      } else {
        throw new Error('Update failed: no rows affected');
      }
    } catch (error) {
      console.error('Error updating lid:', error);
      res.status(404).json({ error: 'Lid not found' }); // Assuming 404 for not found
    }
  },

  delete: async (req, res) => {
    const lidId = req.params.id; // Extract ID from request parameters

    // Basic validation (check if ID is provided)
    if (!lidId) {
      return res.status(400).json({ error: "Missing lid ID in the request" });
    }

    const sqlQuery = `DELETE FROM Lid WHERE id = ?`;

    try {
      const connection = await mysql.createConnection(dbConfig);

      const [result] = await connection.query(sqlQuery, [lidId]);

      if (result.affectedRows === 1) {
        res.status(200).json({ message: `Lid with ID ${lidId} deleted successfully` });
      } else {
        // Assuming 404 for not found lid
        res.status(404).json({ error: "Lid not found" });
      }
    } catch (error) {
      console.error('Error deleting lid:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = lidController;
