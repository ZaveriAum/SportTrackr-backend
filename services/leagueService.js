require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED } = require("../config/errorCodes");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");

const getAllLeagues = async (user) => {
  try {
    let response = await pool.query(
      "SELECT id, league_name, start_time, logo_url from leagues"
    );
    let leagues = response.rows;
    await Promise.all(
      leagues.map(async (league) => {
        league.start_time = new Date(league.start_time).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "long", year: "numeric" }
        );
        league.end_time = new Date(league.end_time).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "long", year: "numeric" }
        );

        league.logo_url = await getObjectSignedUrl(league.logo_url);
        return league;
      })
    );
    return leagues;
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

const getLeague = async (id) => {
  try {
    let query = await pool.query(
    `SELECT 
        l.id,
        l.league_name,
        l.start_time,
        l.end_time,
        l.description,
        l.game_amount,
        l.team_starter_size,
        l.price,
        l.max_team_size,
        l.logo_url,
        (SELECT COUNT(*) FROM teams WHERE league_id = l.id) AS team_count,
        (SELECT COUNT(*) 
        FROM users u
        INNER JOIN teams t ON u.team_id = t.id 
        WHERE t.league_id = l.id) AS user_count,
        (SELECT COUNT(*) FROM league_emp WHERE league_id = l.id) AS employee_count
    FROM leagues l
    WHERE l.id = $1;
    `,
      [id]
    );
    const league = query.rows[0];
    console.log(league.logo_url);
    league.logo_url = await getObjectSignedUrl(league.logo_url);
    return league;
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};
const createLeague = async (user, data, file) => {
  try {
    if ("owner" === user.roles[0]) {
      const {
        leagueName,
        teamStarterSize,
        price,
        maxTeamSize,
        gameAmount,
        startTime,
        endTime,
      } = data;

      let leagueLogoUrl = null;
      if (file) {
        leagueLogoUrl = await uploadFile(
          file.buffer,
          leagueName,
          file.mimetype,
          "league-logos"
        );
      }
      const values = [
        leagueName,
        user.id,
        teamStarterSize,
        price,
        maxTeamSize,
        gameAmount,
        startTime,
        endTime,
        leagueLogoUrl,
      ];
      const league = await pool.query(
        "INSERT INTO public.leagues( league_name, organizer_id, team_starter_size, price, max_team_size, game_amount, start_time, end_time , logo_url) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;",
        values
      );
      return league.rows[0];
    } else {
      throw new AppError(`${UNAUTHORIZED.ACCESS_DENIED}`, 401);
    }
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

module.exports = {
  getAllLeagues,
  getLeague,
  createLeague,
};
