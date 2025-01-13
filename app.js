const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require("cookie-parser")
const cors = require('cors')
const validator = require('./middlewares/validator')

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
}))
app.use(validator.validate)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended : true}))

app.use('/v1/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
