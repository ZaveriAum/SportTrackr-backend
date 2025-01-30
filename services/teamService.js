require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED, BAD_REQUEST } = require("../config/errorCodes");
const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");
const bcrypt = require("bcrypt");

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
      password,
    } = teamInfo;

    if (!homeColor || !awayColor) {
      throw new AppError("Please pick a home and an away jersey color.", 400);
    }
    if (!teamVisibility) {
      throw new AppError("Please choose a team visibility.", 400);
    }

    const teamExistsQuery =
      "SELECT * FROM teams WHERE league_id = $1 AND name = $2";
    const existingTeams = await pool.query(teamExistsQuery, [leagueId, name]);

    if (existingTeams.rows.length > 0) {
      throw new AppError(
        "A team with the same name already exists in this league",
        400
      );
    }
    const isEmployeeQuery =
      "SELECT * FROM league_emp where league_id = $1 AND user_id= $2";
    const isEmployeeResult = await pool.query(isEmployeeQuery, [
      leagueId,
      user.id,
    ]);

    if (isEmployeeResult.rowCount > 0) {
      throw new AppError(
        "Employees are not allowed to play in the league they work at.",
        400
      );
    }

    if (teamVisibility==true && !password) {
      throw new AppError("Private teams require a password.", 400);
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    let teamLogoUrl = null;
    if (file) {
      teamLogoUrl = await uploadFile(
        file.buffer,
        `league-${leagueId}-${name}`,
        file.mimetype,
        "team-logos"
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
      hashedPassword,
    ];
    
    const team = await pool.query(
      `INSERT INTO public.teams(
        name, league_id, description, owner_id, captain_id, 
        home_color, away_color, logo_url, team_visibility, password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;`,
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

const updateTeam = async (userEmail, data, file, teamId) => {
  try {
    const teamQuery = "SELECT * FROM teams WHERE id=$1";
    const teamResults = await pool.query(teamQuery, [teamId]);
    const teamToUpdate = toCamelCase(teamResults.rows[0]);

    if (teamResults.rowCount < 1) {
      throw new AppError(`${BAD_REQUEST.TEAM_NOT_EXISTS}`, 404);
    }

    // Checking if the owner is accesssing the team
    const query = await pool.query('SELECT id from users WHERE email=$1', [userEmail])
    const user = query.rows[0]

    if (user.id !== teamToUpdate.ownerId) {
      throw new AppError(`${UNAUTHORIZED.ACCESS_DENIED}`, 401);
    }

    const teamInfo = data.teamInfo ? JSON.parse(data.teamInfo) : {};
    const {
      name = teamToUpdate.name,
      homeColor = teamToUpdate.homeColor,
      awayColor = teamToUpdate.awayColor,
      description = teamToUpdate.description,
      teamVisibility = teamToUpdate.teamVisibility,
      captainId = teamToUpdate.captainId,
    } = teamInfo;

    if (name !== teamToUpdate.name) {
      const teamExistsQuery =
        "SELECT * FROM teams WHERE league_id = $1 AND name = $2 AND id != $3";
      const existingTeams = await pool.query(teamExistsQuery, [
        teamToUpdate.leagueId,
        name,
        teamId,
      ]);

      if (existingTeams.rowCount > 0) {
        throw new AppError(
          "A team with the same name already exists in this league",
          400
        );
      }
      if (file) {
        const existingFileName = `league-${teamToUpdate.leagueId}-${teamToUpdate.name}`;
        await deleteFile(existingFileName, "team-logos");
      }
    }

    let teamLogoUrl = null;
    if (file) {
      teamLogoUrl = await uploadFile(
        file.buffer,
        `league-${teamToUpdate.leagueId}-${name}`,
        file.mimetype,
        "team-logos"
      );
    }

    const values = [
      name,
      description,
      captainId,
      homeColor,
      awayColor,
      teamLogoUrl,
      teamVisibility,
      teamId,
    ];

    const updateQuery = `
    UPDATE teams
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      captain_id = COALESCE($3, captain_id),
      home_color = COALESCE($4, home_color),
      away_color = COALESCE($5, away_color),
      logo_url = COALESCE($6, logo_url),
      team_visibility = COALESCE($7, team_visibility)
    WHERE id = $8
    RETURNING *;
  `;

    const updatedTeam = await pool.query(updateQuery, values);

    updatedTeam.rows[0].logoUrl = await getObjectSignedUrl(
      updatedTeam.rows[0].logo_url
    );

    return toCamelCase(updatedTeam.rows[0]);
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

const getTeamsByLeagueId = async (leagueId) => {
  try {

    if (!leagueId) {
      throw new AppError("League ID is required", 400);
    }

    const teamsQuery = `
      SELECT 
        t.id, 
        t.name, 
        t.description, 
        t.home_color AS "homeColor", 
        t.away_color AS "awayColor", 
        t.logo_url AS "logoUrl", 
        t.team_visibility AS "teamVisibility", 
        CONCAT(u.first_name, ' ', u.last_name) AS "ownerName",
        (
          SELECT COUNT(*) 
          FROM matches m 
          WHERE m.home_team_id = t.id OR m.away_team_id = t.id
        ) AS "matchesPlayed"
      FROM 
        teams t
      LEFT JOIN 
        users u ON t.owner_id = u.id
      WHERE 
        t.league_id = $1;
    `;
    const result = await pool.query(teamsQuery, [leagueId]);


    const teams = await Promise.all(
      result.rows.map(async (team) => {
        const signedUrl = await getObjectSignedUrl(team.logoUrl);
        const { logoUrl, ...teamWithoutLogoUrl } = team;
        return { ...teamWithoutLogoUrl, signedUrl };
      })
    );

    return teams;
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

const getTeamById = async (teamId) => {
  try {
    if (!teamId) {
      throw new AppError("Team ID is required", 400);
    }

    const teamQuery = `
      SELECT 
        t.id, 
        t.name, 
        t.description, 
        t.home_color AS "homeColor", 
        t.away_color AS "awayColor", 
        t.logo_url AS "logoUrl", 
        t.team_visibility AS "teamVisibility", 
        CONCAT(u.first_name, ' ', u.last_name) AS "ownerName",
        (
          SELECT COUNT(*) 
          FROM matches m 
          WHERE m.home_team_id = t.id OR m.away_team_id = t.id
        ) AS "matchesPlayed"
      FROM 
        teams t
      LEFT JOIN 
        users u ON t.owner_id = u.id
      WHERE 
        t.id = $1;
    `;

    const result = await pool.query(teamQuery, [ teamId]);

    if (result.rows.length === 0) {
      return new AppError(BAD_REQUEST.TEAM_NOT_EXISTS)
    }

    const team = result.rows[0];
    const signedUrl = await getObjectSignedUrl(team.logoUrl);
    const { logoUrl, ...teamWithoutLogoUrl } = team;
    return { ...teamWithoutLogoUrl, signedUrl };

  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

module.exports = {
  createTeam,
  updateTeam,
  getTeamsByLeagueId,
  getTeamById
};
