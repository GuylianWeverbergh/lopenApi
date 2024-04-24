const mysql = require('mysql2/promise');
const dbConfig = require("../config/db");
/* 
const key = process.env.JWT_SECRET */

const rondjeController = {
    readAll: () => { },

            create: async (req, res) => {
        // Validate required fields
        const requiredFields = ['Lid_id', 'Club'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        try {
            const connection = await mysql.createConnection(dbConfig);

            // Retrieve the timestamp of the last occurrence of the club
            const lastOccurrenceQuery = 'SELECT MAX(Timestamp) AS LastTimestamp FROM Rondje WHERE Club = ?';
            const [lastOccurrenceResult] = await connection.query(lastOccurrenceQuery, [req.body.Club]);
            const lastTimestamp = lastOccurrenceResult[0].LastTimestamp;

            // Calculate the current timestamp
            const currentTimestamp = new Date().toLocaleString('be', {
                timeZone: "Europe/Brussels",
            });

            // Convert timestamp strings to Date objects
            const lastTimestampDate = new Date(lastTimestamp);
            const currentTimestampDate = new Date(currentTimestamp);

            // Calculate the time difference in milliseconds
            const timeDifference = lastTimestampDate ? Math.abs(currentTimestampDate - lastTimestampDate) : Infinity;

            let volgorde;
            console.log("lastTimestampDate: " + lastTimestampDate)
            console.log("currentTimestampDate: " + currentTimestampDate)
            console.log("timedif: " + timeDifference)

            if (timeDifference > 600000) { // 600000 milliseconds = 10 minutes
                // Find the highest Volgorde for the specific Club
                const highestVolgordeQuery = 'SELECT MAX(Volgorde) AS MaxVolgorde FROM Rondje WHERE Club = ?';
                const [maxVolgordeResult] = await connection.query(highestVolgordeQuery, [req.body.Club]);
                let maxVolgorde = maxVolgordeResult[0].MaxVolgorde || 0;
                console.log("higher: " + volgorde)
                // Increment the Volgorde for the new Rondje
                volgorde = maxVolgorde + 1;
            } else {
                const highestVolgordeQuery = 'SELECT MAX(Volgorde) AS MaxVolgorde FROM Rondje WHERE Club = ?';
                const [maxVolgordeResult] = await connection.query(highestVolgordeQuery, [req.body.Club]);
                let maxVolgorde = maxVolgordeResult[0].MaxVolgorde || 0;
                volgorde = maxVolgorde + 1;
                console.log("lower: " + volgorde)
            }

            const data = {
                Lid_id: req.body.Lid_id,
                Club: req.body.Club,
                Volgorde: volgorde
            };

            // Prepare the insertion query
            const sqlQuery = 'INSERT INTO Rondje SET ?';

            // Execute the query
            const [result] = await connection.query(sqlQuery, data);

            if (result.affectedRows === 1) {
                const createdlidId = result.insertId;
                res.status(201).json({ message: `Rondje created successfully with ID: ${createdlidId}` });
            } else {
                throw new Error('Insertion failed with unexpected result');
            }

            await connection.end();
        } catch (error) {
            console.error('Error creating lid:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    
    
    update: async (req, res) => {
        const lidId = req.params.id; // Extract ID from request parameters


        const data = {
            Time: req.body.Tijd,
            Gelopen: req.body.Gelopen
        };

        const sqlQuery = `UPDATE Rondje SET ? WHERE id = ?`;

        try {
            const connection = await mysql.createConnection(dbConfig);

            const [result] = await connection.query(sqlQuery, [data, lidId]);

            if (result.affectedRows === 1) {
                res.status(200).json({ message: `Rondje updated successfully` });
            } else {
                throw new Error('Update failed: no rows affected');
            }

            await connection.end();
        } catch (error) {
            console.error('Error updating Rondje:', error);
            res.status(404).json({ error: 'Rondje not found' }); // Assuming 404 for not found
        }
    },

    delete: async (req, res) => {
        const lidId = req.params.id; // Extract ID from request parameters

        // Basic validation (check if ID is provided)
        if (!lidId) {
            return res.status(400).json({ error: "Missing lid ID in the request" });
        }

        const sqlQuery = `DELETE FROM Rondje WHERE id = ?`;

        try {
            const connection = await mysql.createConnection(dbConfig);

            const [result] = await connection.query(sqlQuery, [lidId]);

            if (result.affectedRows === 1) {
                res.status(200).json({ message: `Rondje with ID ${lidId} deleted successfully` });
            } else {
                // Assuming 404 for not found lid
                res.status(404).json({ error: "Rondje not found" });
            }

            await connection.end();
        } catch (error) {
            console.error('Error deleting Rondje:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

}

module.exports = rondjeController;
