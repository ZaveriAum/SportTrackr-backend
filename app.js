const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require("cookie-parser")
const cors = require('cors')
const validator = require('./middlewares/validator')

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // fronend
    credentials: true,
}))
app.use(validator.validate)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended : true}))

app.use('/v1/auth', authRoutes);

module.exports = app;
