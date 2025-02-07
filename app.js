const express = require('express');
const authRoutes = require('./routes/authRoutes');
const leagueRoutes = require('./routes/leagueRoutes')
const employeeRoutes = require('./routes/employeeRoutes')
const userRoutes = require('./routes/userRoutes')
const teamRoutes = require ('./routes/teamRoutes')
const matchRoutes = require ('./routes/matchRoutes')
const connectAccountRoutes = require('./routes/connectAccountRoutes')
const stripeWebHookRoutes = require('./routes/stripeWebhookRoutes')
const transactionRoutes = require('./routes/transactionsRoutes')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/loggingMiddleware');

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
}));

app.use(cookieParser());

app.use('/v1', stripeWebHookRoutes)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log every incoming request
app.use(requestLogger);

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/league', leagueRoutes)
app.use('/v1/league/emp', employeeRoutes)
app.use('/v1/user', userRoutes)
app.use('/v1/team', teamRoutes)
app.use('/v1/match', matchRoutes)
app.use('/v1/connect', connectAccountRoutes)
app.use('/v1/transaction', transactionRoutes)
// Error Logging Middleware
app.use(errorLogger);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
