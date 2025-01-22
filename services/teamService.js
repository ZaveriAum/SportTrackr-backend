require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED } = require("../config/errorCodes");
const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");

const createTeam = async (user, data, file) => {
  try {
    console.log(user.id)
    
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

module.exports = {
  createTeam,
};
