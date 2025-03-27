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

const getMatchDetails = async (matchId, next) => {
  try {
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

    // Ensure matchDetails is not null or undefined
    if (!matchDetails.rows) {
      throw new AppError('No rows found for the given match ID', 404);
    }

    const updatedRows = await Promise.all(
      matchDetails.rows.map(async (row) => {
        if (row.team_logo) {
          row.team_logo = await getObjectSignedUrl(row.team_logo);
        }
        return row;
      })
    );

    return transformTeamData(updatedRows);
  } catch (error) {
    console.error("Error fetching match details:", error);
    next(error); // Passing the error to next middleware
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
      return res.status(400).json({ error: `File ${file.originalname} exceeds 100MB limit.` });
    }
  }

  const highlightsData = body.highlights;

  // Log highlights data for debugging
  console.log('body.highlights:', body);

  const uploadPromises = highlightVideos.map(async (file, index) => {
    const highlight = highlightsData[index];
    
    console.log(`Processing file: ${file.originalname}`);
    console.log(`Highlight Data: matchId = ${highlight.matchId}, playerId = ${highlight.playerId}, type = ${highlight.type}`);
    
    if (!highlight.matchId || !highlight.playerId || !highlight.type) {
      throw new AppError("Missing required metadata (matchId, playerId, or type).", 400);
    }

    const key = `highlights/${highlight.matchId}/${highlight.playerId}/${Date.now()}_${file.originalname}`;
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
      console.log('Insert query result:', rows);

      let fileUrl;
      try {
        fileUrl = await uploadFile(file.buffer, key, file.mimetype);
        console.log(`File uploaded successfully: ${fileUrl}`);
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error; // Re-throw to trigger rollback
      }

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
      throw new AppError("Failed to upload the highlight and update the database.", 500);
    } finally {
      client.release();
    }
  });

  await Promise.all(uploadPromises);

  return { message: "Upload successful!" };
};

const getMatchesByLeagueId = async (leagueId) => {
  try {
    // Fetch all teams in the league
    const teamsQuery = `
      SELECT id, name, logo_url FROM teams WHERE league_id = $1
    `;
    const teamsResult = await pool.query(teamsQuery, [leagueId]);
    const teams = teamsResult.rows || [];

    if (!Array.isArray(teams) || teams.length === 0) {
      return { message: "No teams found in this league", matches: [] };
    }

    // Get all matches in the league
    const teamIds = teams.map(t => t.id);
    const matchesQuery = `
      SELECT id, home_team_id, away_team_id 
      FROM matches 
      WHERE home_team_id = ANY($1) OR away_team_id = ANY($1)
    `;
    const matchesResult = await pool.query(matchesQuery, [teamIds]);
    const matches = matchesResult.rows || [];

    if (!Array.isArray(matches) || matches.length === 0) {
      return { message: "No matches found in this league", matches: [] };
    }

    // Team goals for each match
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
    const goalsData = goalsResult.rows || [];

    // Fetch logo URLs for teams
    for (const team of teams) {
      team.logo_url = team.logo_url ? await getObjectSignedUrl(team.logo_url) : null;
    }

    // Construct match results
    const matchResults = matches.map(match => {
      const matchGoals = goalsData.find(g => g.match_id === match.id) || { home_goals: 0, away_goals: 0 };
      
      const homeTeam = teams.find(t => t.id === match.home_team_id) || {};
      const awayTeam = teams.find(t => t.id === match.away_team_id) || {};

      return {
        matchId: match.id,
        team1: homeTeam.name || "Unknown",
        logo1: homeTeam.logo_url,
        result: `${matchGoals.home_goals} - ${matchGoals.away_goals}`,
        team2: awayTeam.name || "Unknown",
        logo2: awayTeam.logo_url,
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

    if (!result.rows || result.rows.length === 0) {
      throw new AppError("Match not found", 404);
    }

    const match = result.rows[0];

    const signedHomeLogoUrl = match.home_team_logo ? await getObjectSignedUrl(match.home_team_logo) : null;
    const signedAwayLogoUrl = match.away_team_logo ? await getObjectSignedUrl(match.away_team_logo) : null;

    const { home_team_logo, away_team_logo, ...matchWithoutLogos } = match;

    return {
      ...matchWithoutLogos,
      home_team_logo: signedHomeLogoUrl,
      away_team_logo: signedAwayLogoUrl
    };

  } catch (e) {
    console.error("Error fetching match by ID:", e); 
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};


const updateForfeited = async (matchId, forfeitedBy) => {
  if (![1, 2, -1].includes(forfeitedBy)) {
    throw new Error("Invalid forfeitedBy value. It must be 1, 2, or -1.");
  }

  const client = await pool.connect(); // Use client for transactions
  try {
    await client.query("BEGIN"); // Start transaction

    const checkMatchQuery = "SELECT * FROM matches WHERE id = $1";
    const matchResult = await client.query(checkMatchQuery, [matchId]);

    if (matchResult.rows.length === 0) {
      throw new Error("Match not found");
    }

    // Update match's forfeited status
    const updateQuery = `
      UPDATE matches
      SET forfeited = $1
      WHERE id = $2
      RETURNING *
    `;
    const updateResult = await client.query(updateQuery, [forfeitedBy, matchId]);

    if (updateResult.rows.length === 0) {
      throw new Error("Failed to update match forfeited status");
    }

    await client.query("COMMIT"); // Commit transaction
    return updateResult.rows[0]; 
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error during updateForfeited:", error);
    throw new Error("Failed to update match forfeited status");
  } finally {
    client.release(); // Release client connection
  }
};


const createMatch = async (homeTeamId, awayTeamId, matchTime, refereeId, statisticianId, leagueId) => {
  try {
    if (!homeTeamId || !awayTeamId || !matchTime || !refereeId || !statisticianId || !leagueId) {
      throw new Error("All parameters are required: homeTeamId, awayTeamId, matchTime, refereeId, statisticianId, leagueId.");
    }

    const forfeited = '-1';

    const matchResult = await pool.query(
      "INSERT INTO public.matches (home_team_id, away_team_id, match_time, forfeited) VALUES ($1, $2, $3, $4) RETURNING id",
      [homeTeamId, awayTeamId, matchTime, forfeited]
    );
    const matchId = matchResult.rows[0].id;

    const checkAndRegisterLeagueEmp = async (userId, leagueId) => {
      const result = await pool.query(
        "SELECT id FROM public.league_emp WHERE user_id = $1 AND league_id = $2",
        [userId, leagueId]
      );

      if (result.rows.length === 0) {
        console.log(`User ${userId} is not registered in league ${leagueId}. Registering now...`);
        const insertResult = await pool.query(
          "INSERT INTO public.league_emp (user_id, league_id) VALUES ($1, $2) RETURNING id",
          [userId, leagueId]
        );
        return insertResult.rows[0].id;
      }

      return result.rows[0].id;
    };

    const refereeLeagueEmpId = await checkAndRegisterLeagueEmp(refereeId, leagueId);
    const statisticianLeagueEmpId = await checkAndRegisterLeagueEmp(statisticianId, leagueId);

    // Function to assign role if not assigned
    const assignRoleIfNeeded = async (employeeId, roleId) => {
      const existingRole = await pool.query(
        "SELECT * FROM public.employee_roles WHERE employee_id = $1 AND role_id = $2",
        [employeeId, roleId]
      );

      if (existingRole.rows.length === 0) {
        console.log(`Assigning role ${roleId} to employee ${employeeId}`);
        await pool.query(
          "INSERT INTO public.employee_roles (role_id, employee_id) VALUES ($1, $2)",
          [roleId, employeeId]
        );
      }
    };

    // Assign roles (1 = Referee, 2 = Statistician)
    await assignRoleIfNeeded(refereeLeagueEmpId, 1);
    await assignRoleIfNeeded(statisticianLeagueEmpId, 2);

    return { matchId, message: "Match and employee assignments created successfully!" };
  } catch (error) {
    console.error("Service Error:", error.message);
    throw new Error("Error creating match and assigning employees in the database");
  }
};


const getDataCreateMatch = async (leagueId) => {
  try {
    const employeeQuery = `
      SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name, le.id as emp_id
      FROM users u
      JOIN league_emp le ON le.user_id = u.id
      WHERE le.league_id = $1
    `;

    const teamsQuery = `
      SELECT t.name, t.id
      FROM teams t
      WHERE t.league_id = $1
    `;

    const leagueQuery=`SELECT league_name from leagues l where id=$1`

    // Execute both queries and get the results
    const employeesResult = await pool.query(employeeQuery, [leagueId]);
    const teamsResult = await pool.query(teamsQuery, [leagueId]);
    const leagueResult = await pool.query(leagueQuery, [leagueId]);

    

    // Check if either query returns empty results
    if (employeesResult.rows.length === 0 || teamsResult.rows.length === 0 ||  leagueResult.rows.length === 0 ) {
      throw new Error("No employees or teams found for the provided leagueId.");
    }

    return {
      employees: employeesResult.rows,
      teams: teamsResult.rows,
      league: leagueResult.rows
    };
  } catch (error) {
    console.error("Service Error:", error.message);
    throw error;
  }
};

const deleteMatch = async (matchId) => {
  const client = await pool.connect();
  try {
    if (!matchId) {
      throw new Error("Match ID is invalid");
    }

    const deleteMatchQuery = 'DELETE FROM matches WHERE id = $1';
    const result = await client.query(deleteMatchQuery, [matchId]);

    if (result.rowCount === 0) {
      throw new Error("No match found with the provided ID");
    }

    return { message: 'Match deleted successfully!' };
  } catch (error) {
    console.error("Error deleting match:", error.message);  // Log detailed error
    throw new Error("Failed to delete match.");
  } finally {
    client.release();
  }
};

const getMatchesByUser = async (userId) => {
  try {
    const userTeamQuery = `SELECT team_id FROM users WHERE id = $1`;
    const userTeamResult = await pool.query(userTeamQuery, [userId]);

    if (userTeamResult.rows.length === 0 || !userTeamResult.rows[0].team_id) {
      return { message: "User is not assigned to a team", matches: [] };
    }

    const teamId = userTeamResult.rows[0].team_id;

    // Fetch matches
    const matchesQuery = `
      SELECT 
        m.id AS match_id,
        m.home_team_id,
        m.away_team_id,
        m.match_time,
        le.user_id AS referee_id,
        home_team.home_color AS home_color,
        away_team.away_color AS away_color,
        CONCAT(u.first_name, ' ', u.last_name) AS referee_name  
      FROM matches m
      JOIN teams home_team ON home_team.id = m.home_team_id
      JOIN teams away_team ON away_team.id = m.away_team_id
      JOIN league_emp le ON le.league_id = home_team.league_id 
      JOIN employee_roles er ON er.employee_id = le.user_id  
      JOIN users u ON u.id = le.user_id 
      WHERE 
        (m.home_team_id = $1 OR m.away_team_id = $1) 
        AND er.role_id = 3;
    `;

    const matchesResult = await pool.query(matchesQuery, [teamId]);
    const matches = matchesResult.rows || [];

    if (matches.length === 0) {
      return { message: "No matches found for this user", matches: [] };
    }

    // Extract match IDs as integers
    const matchIds = matches.map(m => Number(m.match_id));
    if (matchIds.length === 0) return { matches };

    // Fetch goals for each match
    const teamGoalsQuery = `
      SELECT 
        m.id AS match_id,
        COALESCE(SUM(CASE WHEN us.user_id IN 
          (SELECT id FROM users WHERE team_id = m.home_team_id) 
          THEN us.goals END), 0) AS home_goals,
        COALESCE(SUM(CASE WHEN us.user_id IN 
          (SELECT id FROM users WHERE team_id = m.away_team_id) 
          THEN us.goals END), 0) AS away_goals
      FROM matches m
      LEFT JOIN user_stats us ON us.match_id = m.id
      WHERE m.id = ANY($1::INTEGER[]) 
      GROUP BY m.id;
    `;

    const goalsResult = await pool.query(teamGoalsQuery, [matchIds]);
    const goalsData = goalsResult.rows || [];

    // Fetch team details (name + logo)
    const teamIds = [...new Set(matches.flatMap(m => [Number(m.home_team_id), Number(m.away_team_id)]))];
    const teamsQuery = `SELECT id, name, logo_url FROM teams WHERE id = ANY($1::INTEGER[])`;
    const teamsResult = await pool.query(teamsQuery, [teamIds]);
    let teams = teamsResult.rows || [];

    // Fetch signed URLs in parallel
    teams = await Promise.all(
      teams.map(async (team) => ({
        ...team,
        logo_url: team.logo_url ? await getObjectSignedUrl(team.logo_url) : null,
      }))
    );

    // Construct match results
    const matchResults = matches.map(match => {
      const matchGoals = goalsData.find(g => g.match_id === match.match_id) || { home_goals: 0, away_goals: 0 };

      const homeTeam = teams.find(t => t.id === match.home_team_id) || {};
      const awayTeam = teams.find(t => t.id === match.away_team_id) || {};

      return {
        matchId: match.match_id,
        team1: homeTeam.name || "Unknown",
        logo1: homeTeam.logo_url,
        homeColor: match.home_color,  // Added home color
        homeTeamGoal: matchGoals.home_goals,
        awayTeamGoal: matchGoals.away_goals,
        team2: awayTeam.name || "Unknown",
        logo2: awayTeam.logo_url,
        awayColor: match.away_color,  // Added away color
        matchTime: match.match_time,
        referee: match.referee_name
      };
    });

    return { matches: matchResults };
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw new Error("Internal Server Error");
  }
};
const getHighlights = async () => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
    h.id, 
    h.match_id, 
    h.highlight_url, 
    h.highlight_type, 
    h.highlight_from, 
    m.match_time
FROM highlights h
JOIN matches m ON m.id = h.match_id
ORDER BY m.match_time DESC
LIMIT 7;
    `;
    const { rows } = await client.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching highlights:", error);
    throw new AppError("Failed to retrieve highlights.", 500);
  } 
};

const getHighlightsByUser = async (userId) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
          h.id, 
          h.match_id, 
          h.highlight_url, 
          h.highlight_type, 
          h.highlight_from, 
          m.match_time
      FROM highlights h
      JOIN matches m ON m.id = h.match_id
      WHERE h.highlight_from = $1
      ORDER BY m.match_time DESC
      LIMIT 7;
    `;
    const { rows } = await client.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("Error fetching user highlights:", error);
    throw new AppError("Failed to retrieve user highlights.", 500);
  } finally {
    client.release();
  }
};

module.exports = {
  updateMatch,
  getStats,
  uploadHighlights,
  getMatchDetails,
  getMatchesByLeagueId,
  getMatchById,
  updateForfeited,
  createMatch,
  getDataCreateMatch,
  deleteMatch,
  getMatchesByUser,
  getHighlights,
  getHighlightsByUser
};
