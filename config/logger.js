require('dotenv').config();
const { Pool } = require('pg')

// PostgreSQL connection pool
const loggerPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.LOG_DB_DATABASE,
    port: process.env.DB_PORT,
});

// Function to log messages to PostgreSQL
const dbLog = async (level, message, method, statusCode) => {
    try {
        await loggerPool.query('INSERT INTO logs (level, message, method, status_code) VALUES ($1, $2, $3, $4)',[level, message, method, statusCode]);
    } catch (e) {
        console.error('Failed to log to PostgreSQL:', e);
    }
};

module.exports = dbLog;
