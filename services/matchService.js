require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED, BAD_REQUEST } = require("../config/errorCodes");
const { toCamelCase } = require("../utilities/utilities");

const updateMatch = async (user, data) => {
    try {
    } catch (error) {
        throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
    }
};

module.exports = {
    updateMatch
};
