require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED, BAD_REQUEST } = require("../config/errorCodes");
const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");

const updateMatch = async (user, data) => {
  try {
    const { matchId, homeTeam, awayTeam } = data;
    const query = "SELECT league_id FROM teams WHERE id = $1";
    const values = [homeTeam.id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new AppError(BAD_REQUEST.TEAM_NOT_EXISTS, 404);
    }
    const leagueId = result.rows[0].league_id;

    const players = [...homeTeam.players, ...awayTeam.players];

    for (const player of players) {
      const {
        id,
        goals,
        shots,
        assists,
        saves,
        interceptions,
        yellowCards,
        redCard,
      } = player;

      const insertQuery = `
                INSERT INTO user_stats (user_id, match_id, goals, shots, assists, saves, interceptions, yellow_card, red_card)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
      const insertValues = [
        id,
        matchId,
        goals,
        shots,
        assists,
        saves,
        interceptions,
        yellowCards,
        redCard,
      ];
      await pool.query(insertQuery, insertValues);
    }
    return leagueId;
  } catch (error) {
    throw error;
  }
};

const getMainStats = async (teamId) => {
  const mainStatsQuery = `
    SELECT u.first_name, 
       MAX(us.goals) AS max_goals, 
       MAX(us.assists) AS max_assists, 
       MAX(us.yellow_card) AS max_yellow_card, 
       MAX(us.red_card) AS max_red_card
    FROM user_stats us
    JOIN users u ON u.id = us.user_id
    WHERE u.team_id = $1
    GROUP BY u.first_name;
  `;
  
  const players = await pool.query(mainStatsQuery, [teamId]);
  const stats = ["max_goals", "max_assists", "max_yellow_card", "max_red_card"];
  const statNames = ["Goals", "Assists", "Yellow Cards", "Red Cards"];

  return statNames.map((statName) => ({
    name: statName,
    ...players.rows.reduce((acc, player) => {
      const playerName = player.first_name;
      const statKey = stats[statNames.indexOf(statName)];
      acc[playerName] = player[statKey];
      return acc;
    }, {}),
  }));
};

const getTopGoalScorers = async (teamId) => {
  const goalScorersQuery = `
    WITH TopScorers AS (
        SELECT us.user_id, SUM(us.goals) AS total_goals
        FROM user_stats us
        JOIN users u ON us.user_id = u.id
        JOIN matches m ON (m.home_team_id = u.team_id OR m.away_team_id = u.team_id)
        WHERE u.team_id = $1
        GROUP BY us.user_id
        ORDER BY total_goals DESC
        LIMIT 3
    )
    SELECT 
        us.user_id, 
        u.first_name, 
        m.id AS match_id, 
        us.goals AS goals_in_match
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    JOIN matches m ON (m.home_team_id = u.team_id OR m.away_team_id = u.team_id)
    JOIN TopScorers ts ON us.user_id = ts.user_id
    WHERE 
        (m.home_team_id = u.team_id AND us.user_id = u.id) 
        OR 
        (m.away_team_id = u.team_id AND us.user_id = u.id)
    GROUP BY us.user_id, u.first_name, m.id, us.goals
    ORDER BY u.first_name, m.id;
  `;
  
  const result = [];
  const topGoalScorers = await pool.query(goalScorersQuery, [teamId]);

  topGoalScorers.rows.forEach(({ first_name, match_id, goals_in_match }) => {
    let matchEntry = result.find(entry => entry.game === match_id);
    if (!matchEntry) {
      matchEntry = { game: match_id };
      result.push(matchEntry);
    }

    matchEntry[first_name] = (matchEntry[first_name] || 0) + goals_in_match;
  });

  return result;
};

const getShots = async (teamId) => {
  const shotsQuery = `
    SELECT us.user_id, u.first_name, SUM(us.shots) AS total_shots
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    WHERE u.team_id = $1 
    GROUP BY us.user_id, u.first_name
    ORDER BY total_shots DESC
    LIMIT 5;
  `;
  
  const shots = await pool.query(shotsQuery, [teamId]);
  return shots.rows.map(player => ({
    name: player.first_name,
    value: Number(player.total_shots),
  }));
};

const getTopInterceptors = async (teamId) => {
  const topInterceptorsQuery = `
    WITH TopInterceptors AS (
      SELECT us.user_id, SUM(us.interceptions) AS total_interceptions
      FROM user_stats us
      JOIN users u ON us.user_id = u.id
      JOIN matches m ON (m.home_team_id = u.team_id OR m.away_team_id = u.team_id)
      WHERE u.team_id = $1
      GROUP BY us.user_id
      ORDER BY total_interceptions DESC
      LIMIT 3
    )
    SELECT 
        us.user_id, 
        u.first_name, 
        m.id AS match_id, 
        us.interceptions AS interceptions_in_match
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    JOIN matches m ON (m.home_team_id = u.team_id OR m.away_team_id = u.team_id)
    JOIN TopInterceptors ti ON us.user_id = ti.user_id
    WHERE 
        (m.home_team_id = u.team_id AND us.user_id = u.id) 
        OR 
        (m.away_team_id = u.team_id AND us.user_id = u.id)
    GROUP BY us.user_id, u.first_name, m.id, us.interceptions
    ORDER BY u.first_name, m.id;
  `;
  
  const result = [];
  const topInterceptors = await pool.query(topInterceptorsQuery, [teamId]);

  topInterceptors.rows.forEach(({ first_name, match_id, interceptions_in_match }) => {
    let matchEntry = result.find(entry => entry.game === match_id);
    if (!matchEntry) {
      matchEntry = { game: match_id };
      result.push(matchEntry);
    }

    matchEntry[first_name] = (matchEntry[first_name] || 0) + interceptions_in_match;
  });

  return result;
};

const getStats = async (user) => {
  console.log(user)
  const teamQuery = `SELECT team_id FROM users WHERE id=$1`
  const team = await pool.query(teamQuery, [user.id]);
  const teamId = team.rows[0].team_id
  if(!teamId ){
    throw new AppError(BAD_REQUEST.TEAM_NOT_EXISTS)
  }
  const mainStats = await getMainStats(teamId);
  const topGoalScorers = await getTopGoalScorers(teamId);
  const shotsResult = await getShots(teamId);
  const topInterceptors = await getTopInterceptors(teamId);
  return {
    mainStats,
    topGoalScorers,
    shotsResult,
    topInterceptors,
  };
};


module.exports = {
  updateMatch,
  getStats,
};
