require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED, BAD_REQUEST } = require("../utilities/errorCodes");
const { transformTeamData } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");

const updateMatch = async (user, data) => {
  try {
    const { matchId, homeTeam, awayTeam } = data;

    //  if both teams exist
    const homeTeamQuery = "SELECT league_id FROM teams WHERE id = $1";
    const homeTeamValues = [homeTeam.id];
    const homeTeamResult = await pool.query(homeTeamQuery, homeTeamValues);

    if (homeTeamResult.rows.length === 0) {
      throw new AppError(BAD_REQUEST.TEAM_NOT_EXISTS, 404);
    }
    const leagueId = homeTeamResult.rows[0].league_id;

    const awayTeamQuery = "SELECT league_id FROM teams WHERE id = $1";
    const awayTeamValues = [awayTeam.id];
    const awayTeamResult = await pool.query(awayTeamQuery, awayTeamValues);

    if (awayTeamResult.rows.length === 0) {
      throw new AppError(BAD_REQUEST.TEAM_NOT_EXISTS, 404);
    }

    // both teams' players
    const players = [...homeTeam.players, ...awayTeam.players];

    // through each player and insert stats
    for (const player of players) {
      const {
        user_id,
        stats: { goals, shots, assists, saves, interceptions, yellow_card, red_card },
      } = player;

      if (!user_id) {
        console.error('Player ID is missing:', player);
        continue; // Skip this player if ID is invalid
      }

      const goalValue = parseInt(goals, 10) || 0;
      const shotValue = parseInt(shots, 10) || 0;
      const assistValue = parseInt(assists, 10) || 0;
      const saveValue = parseInt(saves, 10) || 0;
      const interceptionValue = parseInt(interceptions, 10) || 0;
      const yellowCardValue = parseInt(yellow_card, 10) || 0;
      const redCardValue = parseInt(red_card, 10) || 0;

      const checkPlayerStatsQuery = `
        SELECT * FROM user_stats WHERE user_id = $1 AND match_id = $2
      `;
      const checkPlayerStatsValues = [user_id, matchId];
      const checkResult = await pool.query(checkPlayerStatsQuery, checkPlayerStatsValues);

      if (checkResult.rows.length > 0) {
        const updateQuery = `
          UPDATE user_stats
          SET goals = $1, shots = $2, assists = $3, saves = $4, interceptions = $5, 
              yellow_card = $6, red_card = $7
          WHERE user_id = $8 AND match_id = $9
        `;
        const updateValues = [
          goalValue,
          shotValue,
          assistValue,
          saveValue,
          interceptionValue,
          yellowCardValue,
          redCardValue,
          user_id, 
          matchId,
        ];
        await pool.query(updateQuery, updateValues);
      } else {
        // If no stats exist, insert new stats
        const insertQuery = `
          INSERT INTO user_stats (user_id, match_id, goals, shots, assists, saves, interceptions, yellow_card, red_card)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const insertValues = [
          user_id,
          matchId,
          goalValue,
          shotValue,
          assistValue,
          saveValue,
          interceptionValue,
          yellowCardValue,
          redCardValue,
        ];
        await pool.query(insertQuery, insertValues);
      }
    }
    return leagueId;
  } catch (error) {
    console.error("Error updating match:", error);
    throw error;
  }
};



const getMatchDetails = async (matchId) => {
  const matchDetailsQuery = `
    SELECT DISTINCT
        m.id AS match_id,
        u.id AS user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        t.name AS user_team_name,
        t.logo_url AS team_logo,
        us.position_played,
        SUM(us.goals) AS goals,
        SUM(us.shots) AS shots,
        SUM(us.assists) AS assists,
        SUM(us.saves) AS saves,
        SUM(us.interceptions) AS interceptions,
        us.number,
        SUM(us.yellow_card) AS yellow_card,
        SUM(us.red_card) AS red_card,
        u.team_id
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    JOIN users u ON u.team_id IN (m.home_team_id, m.away_team_id)
    JOIN teams t ON u.team_id = t.id
    LEFT JOIN user_stats us ON u.id = us.user_id
    WHERE m.id = $1
    GROUP BY m.id, u.id, u.first_name, u.last_name, u.email, t.name, t.logo_url, us.position_played, us.number, u.team_id
    ORDER BY u.team_id, u.id;
  `;

  const matchDetails = await pool.query(matchDetailsQuery, [matchId]);

  if (matchDetails.rowCount < 1) {
    throw new AppError(BAD_REQUEST.MATCH_NOT_EXISTS, 404);
  }

  const updatedRows = await Promise.all(
    matchDetails.rows.map(async (row) => {
      row.team_logo = await getObjectSignedUrl(row.team_logo || DEFAULT_TEAM_LOGO);
      return row;
    })
  );

  return transformTeamData(updatedRows);
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
    let matchEntry = result.find((entry) => entry.game === match_id);
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
  return shots.rows.map((player) => ({
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

  const topInterceptorsResult = [];
  const topInterceptors = await pool.query(topInterceptorsQuery, [teamId]);

  topInterceptors.rows.forEach(
    ({ first_name, match_id, interceptions_in_match }) => {
      let matchEntry = topInterceptorsResult.find(
        (entry) => entry.game === match_id
      );

      if (!matchEntry) {
        matchEntry = { game: match_id };
        topInterceptorsResult.push(matchEntry);
      }
      if (match_id === 1) {
        matchEntry[first_name] = interceptions_in_match;
      } else {
        matchEntry[first_name] =
          (matchEntry[first_name] || 0) + interceptions_in_match;
      }
    }
  );

  return topInterceptorsResult;
};

const getStats = async (user) => {
  const teamQuery = `SELECT team_id FROM users WHERE email=$1`;
  const team = await pool.query(teamQuery, [user.email]);

  const teamId = team.rows[0].team_id;

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

const uploadHighlights = async (user, files, body) => {
  let highlightVideos = [];

  for (const field in files) {
    highlightVideos = highlightVideos.concat(files[field]);
  }

  for (const file of highlightVideos) {
    if (file.size > 100 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: `File ${file.originalname} exceeds 100MB limit.` });
    }
  }

  const highlightsData = body.highlights;

  const uploadPromises = highlightVideos.map(async (file, index) => {
    const highlight = highlightsData[index];

    if (!highlight.matchId || !highlight.playerId || !highlight.type) {
      throw new AppError(
        "Missing required metadata (matchId, playerId, or type).",
        400
      );
    }

    const key = `highlights/${highlight.matchId}/${
      highlight.playerId
    }/${Date.now()}_${file.originalname}`;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertHighlightQuery = `
        INSERT INTO highlights(match_id, highlight_url, highlight_type, highlight_from)
        VALUES ($1, $2, $3, $4) RETURNING id
      `;
      const { rows } = await client.query(insertHighlightQuery, [
        highlight.matchId,
        null,
        highlight.type,
        highlight.playerId,
      ]);
      const highlightId = rows[0].id;
      const fileUrl = await uploadFile(file.buffer, key, file.mimetype);
      const updateHighlightQuery = `
        UPDATE highlights
        SET highlight_url = $1
        WHERE id = $2
      `;
      await client.query(updateHighlightQuery, [fileUrl, highlightId]);

      await client.query("COMMIT");

      return {
        matchId: highlight.matchId,
        playerId: highlight.playerId,
        type: highlight.type,
        videoUrl: fileUrl,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error during file upload or database operations:", error);
      throw new AppError(
        "Failed to upload the highlight and update the database.",
        500
      );
    } finally {
      client.release();
    }
  });

  await Promise.all(uploadPromises);

  return { message: "Upload successful!" };
};


const getMatchesByLeagueId = async (leagueId) => {
  try {
    //  all teams in the league
    const teamsQuery = `
      SELECT id, name, logo_url FROM teams WHERE league_id = $1
    `;
    const teamsResult = await pool.query(teamsQuery, [leagueId]);
    const teams = teamsResult.rows;

    if (teams.length === 0) {
      return { message: "No teams found in this league", matches: [] };
    }

    // get all matches in the league
    const teamIds = teams.map(t => t.id);
    const matchesQuery = `
      SELECT id, home_team_id, away_team_id 
      FROM matches 
      WHERE home_team_id = ANY($1) OR away_team_id = ANY($1)
    `;
    const matchesResult = await pool.query(matchesQuery, [teamIds]);
    const matches = matchesResult.rows;

    if (matches.length === 0) {
      return { message: "No matches found in this league", matches: [] };
    }

    // team goals for each match
    const matchIds = matches.map(m => m.id);
    if (matchIds.length === 0) return { matches };

    const teamGoalsQuery = `
    SELECT 
        m.id AS match_id,
        m.home_team_id AS home_team_id,
        COALESCE(SUM(CASE WHEN us.user_id IN (
            SELECT id FROM users WHERE team_id = m.home_team_id
        ) THEN us.goals END), 0) AS home_goals,
        m.away_team_id AS away_team_id,
        COALESCE(SUM(CASE WHEN us.user_id IN (
            SELECT id FROM users WHERE team_id = m.away_team_id
        ) THEN us.goals END), 0) AS away_goals
    FROM matches m
    LEFT JOIN user_stats us ON us.match_id = m.id
    WHERE m.id = ANY($1)
    GROUP BY m.id, m.home_team_id, m.away_team_id;
`;

const goalsResult = await pool.query(teamGoalsQuery, [matchIds]);
const goalsData = goalsResult.rows;
for (const team of teams) {
  team.logo_url = await getObjectSignedUrl(team.logo_url || DEFAULT_TEAM_LOGO);
}

// Construct match results
const matchResults = matches.map(match => {
    const matchGoals = goalsData.find(g => g.match_id === match.id) || { home_goals: 0, away_goals: 0 };


    return {
        matchId: match.id,
        team1: teams.find(t => t.id === match.home_team_id)?.name || "Unknown",
        logo1: teams.find(t => t.id === match.home_team_id)?.logo_url ,
        result: `${matchGoals.home_goals} - ${matchGoals.away_goals}`,
        team2: teams.find(t => t.id === match.away_team_id)?.name || "Unknown",
        logo2: teams.find(t => t.id === match.away_team_id)?.logo_url,
    };
});

    return { matches: matchResults };
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw new Error("Internal Server Error");
  }
};


//get match by id

const getMatchById = async (matchId) => {
  try {
    if (!matchId) {
      throw new AppError("Match ID is required", 400);
    }

    const matchQuery = `
      SELECT 
        m.*, 
        ht.logo_url AS home_team_logo, 
        at.logo_url AS away_team_logo,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM 
        matches m
      LEFT JOIN 
        teams ht ON m.home_team_id = ht.id 
      LEFT JOIN 
        teams at ON m.away_team_id = at.id
      WHERE 
        m.id = $1;

    `;
    
    const result = await pool.query(matchQuery, [matchId]);

    if (result.rows.length === 0) {
      throw new AppError("Match not found", 404);
    }

    const match = result.rows[0];  

    const signedHomeLogoUrl = await getObjectSignedUrl(match.home_team_logo);
    const signedAwayLogoUrl = await getObjectSignedUrl(match.away_team_logo);

    const { home_team_logo, away_team_logo, ...matchWithoutLogos } = match;

    return {
      ...matchWithoutLogos,
      home_team_logo: signedHomeLogoUrl,
      away_team_logo: signedAwayLogoUrl
    };

  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

const getMatchDetailsWithPlayerStat = async (matchId, teamId) => {
  // Update query with placeholders for matchId and teamId
  const matchDetailsQuery = `
    SELECT
      m.id AS match_id,
      u.id AS user_id,
      t.name AS team_name,
      home_team.name AS home_team_name,
      away_team.name AS away_team_name,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email AS user_email,
      us.position_played,
      SUM(us.goals) AS goals,
      SUM(us.shots) AS shots,
      SUM(us.assists) AS assists,
      SUM(us.saves) AS saves,
      SUM(us.interceptions) AS interceptions,
      us.number,
      SUM(us.yellow_card) AS yellow_card,
      SUM(us.red_card) AS red_card,
      u.team_id,
      m.home_team_id,
      m.away_team_id
    FROM matches m
    JOIN teams t ON t.id = $2
    JOIN teams home_team ON home_team.id = m.home_team_id
    JOIN teams away_team ON away_team.id = m.away_team_id
    JOIN users u ON u.team_id = t.id
    JOIN user_stats us ON u.id = us.user_id
    WHERE m.id = $1 AND u.team_id IN (m.home_team_id, m.away_team_id)
    GROUP BY m.id, u.id, t.name, home_team.name, away_team.name, CONCAT(u.first_name, ' ', u.last_name), u.email, us.position_played, us.number, u.team_id, m.home_team_id, m.away_team_id;
  `;

  try {
    // Execute the query with the matchId and teamId as parameters
    const matchDetails = await pool.query(matchDetailsQuery, [matchId, teamId]);

    if (matchDetails.rowCount < 1) {
      throw new AppError(BAD_REQUEST.MATCH_NOT_EXISTS, 404);  // Throw error if no results are found
    }

    // Organize the match data
    const matchData = {
      matchId: matchId,
      homeTeam: {
        id: matchDetails.rows[0].home_team_id,
        name: matchDetails.rows[0].home_team_name,
      },
      awayTeam: {
        id: matchDetails.rows[0].away_team_id,
        name: matchDetails.rows[0].away_team_name,
      },
      team: {
        id: teamId,
        name: matchDetails.rows[0].team_name,
        players: [],
      },
    };

    // Populate the team players list from the result
    matchDetails.rows.forEach((row) => {
      matchData.team.players.push({
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        position_played: row.position_played,
        goals: row.goals || 0,  // Ensure defaults if any stats are null
        shots: row.shots || 0,
        assists: row.assists || 0,
        saves: row.saves || 0,
        interceptions: row.interceptions || 0,
        number: row.number || null,
        yellow_card: row.yellow_card || 0,
        red_card: row.red_card || 0,
      });
    });

    return matchData;  // Return the structured match data
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching match details:", error);
    throw new AppError(BAD_REQUEST.FAILED_TO_FETCH, 500);  // Handle any database or logic errors
  }
};






module.exports = {
  updateMatch,
  getStats,
  uploadHighlights,
  getMatchDetails,
  getMatchesByLeagueId,
  getMatchById,
};
