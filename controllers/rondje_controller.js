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
            const lastTimestamp2 = new Date(lastTimestamp).toLocaleString('be', {
                timeZone: "Europe/Brussels",
              });
            const currentTimestamp = new Date().toLocaleString('be', {
                timeZone: "Europe/Brussels",
              });
            console.log("lastTimestamp:" + lastTimestamp2 + "current: " + currentTimestamp+ (currentTimestamp-lastTimestamp));
            // Calculate the time difference in minutes
            const timeDifference = lastTimestamp2 ? Math.abs(currentTimestamp - lastTimestamp2) / (1000 * 60) : Infinity;
            console.log("timedifference:" + timeDifference);

            let volgorde;
    
            if (timeDifference > 10) {
                // Find the highest Volgorde for the specific Club
                const highestVolgordeQuery = 'SELECT MAX(Volgorde) AS MaxVolgorde FROM Rondje WHERE Club = ?';
                const [maxVolgordeResult] = await connection.query(highestVolgordeQuery, [req.body.Club]);
                let maxVolgorde = maxVolgordeResult[0].MaxVolgorde || 0;
    
                // Ensure Volgorde can't be less than 5 less than the highest value
                const minAllowedVolgorde = Math.max(1, maxVolgorde - 1);
    
                // Increment the Volgorde for the new Rondje
                console.log("bigger than 10" + minAllowedVolgorde + 1);
                volgorde = minAllowedVolgorde + 1;
                
            } else {
                const highestVolgordeQuery = 'SELECT MAX(Volgorde) AS MaxVolgorde FROM Rondje WHERE Club = ?';
                const [maxVolgordeResult] = await connection.query(highestVolgordeQuery, [req.body.Club]);
                let maxVolgorde = maxVolgordeResult[0].MaxVolgorde || 0;
                console.log("smaller than 10" + "max volgorde is: " + maxVolgorde);
                volgorde = maxVolgorde + 1; // Assuming lastVolgorde is retrieved from the database
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
