require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED } = require("../config/errorCodes");
const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");

const createTeam = async (user, data, file) => {
  try {
    if (user.teamId !== null) {
      throw new AppError(`${UNAUTHORIZED.ACCESS_DENIED}`, 401);
    }
    const teamInfo = JSON.parse(data.teamInfo);
    const {
      name,
      homeColor,
      awayColor,
      description,
      teamVisibility,
      leagueId,
    } = teamInfo;

    const teamExistsQuery =
      "SELECT * FROM teams WHERE league_id = $1 AND name = $2";
    const existingTeams = await pool.query(teamExistsQuery, [leagueId, name]);

    if (existingTeams.rows.length > 0) {
      throw new AppError(
        "A team with the same name already exists in this league",
        400
      );
    }
    if (!homeColor || !awayColor) {
      throw new AppError("Please pick a home and an away jersey color.", 400);
    }
    if (!teamVisibility) {
      throw new AppError("Please choose a team visibility.", 400);
    }
    let teamLogoUrl = null;
    if (file) {
      teamLogoUrl = await uploadFile(
        file.buffer,
        name,
        file.mimetype,
        "league-logos"
      );
    }

    const values = [
      name,
      leagueId,
      description,
      user.id,
      user.id,
      homeColor,
      awayColor,
      teamLogoUrl,
      teamVisibility,
    ];

    const team = await pool.query(
      "INSERT INTO public.teams(name, league_id, description, owner_id, captain_id,home_color,away_color,logo_url,team_visibility) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;",
      values
    );

    team.rows[0].logoUrl = await getObjectSignedUrl(team.rows[0].logo_url);
    return toCamelCase(team.rows[0]);
  } catch (e) {
    if (
      e.code === "22P02" ||
      e.message.includes("invalid input value for enum")
    ) {
      throw new AppError(
        "Invalid value provided for color. Please pick from our list",
        400
      );
    }
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

module.exports = {
  createTeam,
};
