const mysql = require("mysql2");

// Connectie aanmaken naar Databank (createConnection)

// NIET VEILIG OM CREDENTIALS IN EEN PLAIN JS BESTAND TE ZETTEN
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
};

// // Asynchrone code - JavaScript callbacks
// connection.connect((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Connectie succesvol!");
//   }
// });

module.exports = dbConfig;
