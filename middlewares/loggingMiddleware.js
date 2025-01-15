const dbLog = require('../config/logger');

// Request logging middleware for all incoming requests
const requestLogger = async (req, res, next) => {
    try {
        // Log basic info about the request
        await dbLog('info', `Request received: ${req.method} ${req.url}`, req.method, res.statusCode);
    } catch (err) {
        console.error("Failed to log request:", err.message);
    }
    next();
};

// Error logging middleware for error scenarios
const errorLogger = async (err, req, res, next) => {
    try {
        // Log error details
        await dbLog('error', `Error: ${err.message}`, req.method, err.statusCode);
    } catch (logErr) {
        console.error("Failed to log error:", logErr.message);
    }
    next(err); // Pass the error to the next middleware
};

module.exports = {
    requestLogger,
    errorLogger
};
