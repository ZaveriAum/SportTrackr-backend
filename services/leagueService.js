require("dotenv").config();
const pool = require("../config/db");
const {
  AppError,
  UNAUTHORIZED,
  BAD_REQUEST,
} = require("../utilities/errorCodes");
const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");
const DEFAULT_LEAGUE_LOGO = "defualts/default_league_photo.png";
const DEFAULT_PROFILE_PICTURE = "defualts/default_profile_photo.jpeg";
const {
  refund,
  calculateRefundAmount,
  getAccountBalance,
} = require("./paymentService");
const {
  sendTeamDeletionToOwner,
  sendRefundConfirmationToOwner,
  sendTeamDeletionToPlayer,
  sendLeagueOwnerRefund,
  sendLeagueOwnerDeletionConfirmation,
} = require("./mailService");

const getAllLeagues = async () => {
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

        const url = league.logo_url
          ? await getObjectSignedUrl(league.logo_url)
          : await getObjectSignedUrl(DEFAULT_LEAGUE_LOGO);

        league.logo_url = url;
        return league;
      })
    );
    return leagues.map(toCamelCase);
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
    const url = league.logo_url
      ? await getObjectSignedUrl(league.logo_url)
      : await getObjectSignedUrl(DEFAULT_LEAGUE_LOGO);

    league.logo_url = url;
    return toCamelCase(league);
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

const createLeague = async (email, roles, data, file) => {
  try {
    if (roles.includes("owner")) {
      const {
        leagueName,
        teamStarterSize,
        price,
        maxTeamSize,
        gameAmount,
        startTime,
        endTime,
        description,
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

      const user = await pool.query("SELECT id FROM users WHERE email=$1", [
        email,
      ]);

      const values = [
        leagueName,
        user.rows[0].id,
        teamStarterSize,
        price,
        maxTeamSize,
        gameAmount,
        startTime,
        endTime,
        leagueLogoUrl,
        description,
      ];
      const league = await pool.query(
        "INSERT INTO public.leagues( league_name, organizer_id, team_starter_size, price, max_team_size, game_amount, start_time, end_time , logo_url,description) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9,$10) RETURNING *;",
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

// only give option to update name
const updateLeague = async (user, leagueId, body) => {
  try {
    if (user.roles.includes("owner") || user.roles.includes("admin")) {
      // Check if league exists
      const league = await pool.query(
        "Select organizer_id, league_name FROM leagues WHERE id = $1",
        [leagueId]
      );

      const { leagueName } = body;

      if (league.rows.length === 0) {
        throw new AppError("League does not exists", 400);
      }

      if (league.rows[0].organizer_id !== user.id) {
        throw new AppError(BAD_REQUEST.ACCESS_DENIED, 401);
      }

      await pool.query(
        "UPDATE public.leagues SET league_name=$1 WHERE id = $2",
        [leagueName, leagueId]
      );
    } else {
      throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400);
    }
  } catch (e) {
    throw new AppError(
      e.message || "Unable to update league",
      e.statusCode || 400
    );
  }
};

// delete the previous logo
const uploadLeagueLogo = async (user, file, leagueId) => {
  try {
    if (user.roles.includes("owner") || user.roles.includes("admin")) {
      const league = await pool.query(
        "SELECT organizer_id, logo_url FROM leagues WHERE id=$1",
        [leagueId]
      );
      const employee = await pool.query(
        "SELECT id FROM league_emp WHERE user_id=$1 and league_id=$2",
        [user.id, leagueId]
      );
      if (!file) {
        throw new AppError("No file uploaded", 400);
      }

      if (
        league.rows[0].organizer_id !== user.id &&
        employee.rows.length === 0
      ) {
        throw new AppError(BAD_REQUEST.ACCESS_DENIED, 401);
      }

      const { buffer, originalname, mimetype } = file;
      // Delete the previous logo.
      await deleteFile(league.rows[0].logo_url);
      // Upload the new logo
      const key = await uploadFile(
        buffer,
        originalname,
        mimetype,
        "league-logos"
      );
      await pool.query("UPDATE leagues SET logo_url = $1 WHERE id = $2", [
        key,
        leagueId,
      ]);
    } else {
      throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400);
    }
  } catch (e) {
    throw new AppError(
      e.message || "Unable to upload League Logo",
      e.statusCode || 400
    );
  }
};

const deleteLeague = async (email, roles, leagueId) => {
  try {
    if (roles.includes("owner")) {
      // Check if User is the owner Of the league
      const league = await pool.query(
        "SELECT organizer_id FROM leagues WHERE id=$1",
        [leagueId]
      );
      const user = await pool.query("SELECT id FROM users WHERE email=$1", [
        email,
      ]);

      if (league.rows[0].organizer_id !== user.rows[0].id)
        throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400);

      // Check if league has already started Team can only be deleted 5 days before the leagues get started
      const query = await pool.query(
        "SELECT start_time, league_name FROM leagues WHERE id=$1",
        [leagueId]
      );
      const leagueName = query.rows[0].league_name;
      const leagueOwner = await pool.query(
        "SELECT email, first_name, last_name FROM users WHERE id=$1",
        [league.rows[0].organizer_id]
      );

      const startTime = new Date(query.rows[0].start_time);
      const fiveDaysBeforeStart = new Date(startTime);
      fiveDaysBeforeStart.setDate(startTime.getDate() - 5);

      const teams = await pool.query(
        "SELECT id from teams WHERE league_id=$1",
        [leagueId]
      );

      const transactions = await pool.query(
        `SELECT intent_id, amount, team_id FROM transactions WHERE team_id IN (SELECT id FROM teams WHERE league_id=$1)`,
        [leagueId]
      );
      let totalAmount = 0;

      // Refund all the teams
      transactions.rows.forEach(async (transaction) => {
        totalAmount += transaction.amount;
        await refund(transaction.intent_id, transaction.amount * 100, false);
      });

      await sendLeagueOwnerDeletionConfirmation(
        leagueOwner.rows[0].email,
        `${leagueOwner.rows[0].first_name} ${leagueOwner.rows[0].last_name}`,
        leagueName
      );
      await sendLeagueOwnerRefund(
        leagueOwner.rows[0].email,
        `${leagueOwner.rows[0].first_name} ${leagueOwner.rows[0].last_name}`,
        leagueName,
        totalAmount
      );

      teams.rows.forEach(async (team) => {
        let teamId = team.id;

        let te = await pool.query(
          "SELECT logo_url, owner_id, captain_id, name FROM teams WHERE id=$1",
          [teamId]
        );
        if (te.rows[0].logo_url) await deleteFile(te.rows[0].logo_url);
        transactionStarted = true;

        const trans = await pool.query(
          "DELETE FROM transactions WHERE team_id=$1 RETURNING *",
          [teamId]
        );

        await pool.query("BEGIN");

        const team_players = await pool.query(
          "SELECT email, first_name, last_name FROM users WHERE team_id=$1",
          [teamId]
        );
        const owner_email = await pool.query(
          "SELECT email, first_name, last_name FROM users WHERE id=$1",
          [te.rows[0].owner_id]
        );
        const captain_email = await pool.query(
          "SELECT email, first_name, last_name FROM users WHERE id=$1",
          [te.rows[0].captain_id]
        );

        await sendTeamDeletionToOwner(
          owner_email.rows[0].email,
          `${owner_email.rows[0].first_name} ${owner_email.rows[0].last_name}`,
          te.rows[0].name
        );
        await sendRefundConfirmationToOwner(
          owner_email.rows[0].email,
          `${owner_email.rows[0].first_name} ${owner_email.rows[0].last_name}`,
          trans.rows[0].charge_id,
          trans.rows[0].amount
        );
        team_players.rows.forEach(async (player) => {
          await sendTeamDeletionToPlayer(
            player.email,
            `${player.first_name} ${player.last_name}`,
            "League Organizer Has successfully deleted the League",
            "League Deleted"
          );
        });
        if (owner_email.rows[0].email !== owner_email.rows[0].email) {
          await sendTeamDeletionToPlayer(
            captain_email.rows[0].email,
            `${captain_email.rows[0].first_name} ${captain_email.rows[0].last_name}`,
            "League Organizer Has successfully deleted the League",
            "League Deleted"
          );
        }
      });

      // Delete employee roles for employees linked to the league
      await pool.query(
        `DELETE FROM employee_roles WHERE employee_id IN (SELECT id FROM league_emp WHERE league_id = $1)`,
        [leagueId]
      );

      // Delete employees linked to the league
      await pool.query(`DELETE FROM league_emp WHERE league_id = $1`, [
        leagueId,
      ]);

      // Delete teams linked to the league
      await pool.query(`DELETE FROM teams WHERE league_id = $1`, [leagueId]);

      // Delete the league
      const result = await pool.query(
        `DELETE FROM leagues WHERE id = $1 RETURNING logo_url`,
        [leagueId]
      );

      if (result.rows[0].logo_url)
        // Deleting the league logo
        deleteFile(result.rows[0].logo_url);

      await pool.query("COMMIT");
    } else {
      throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400);
    }
  } catch (e) {
    await pool.query("ROLLBACK");
    throw new AppError(
      e.message || "Error deleting the league",
      e.statusCode || 401
    );
  }
};
const getLeagueNamesByOwner = async (ownerEmail) => {
  try {
    if (!ownerEmail) {
      throw new AppError(UNAUTHORIZED.ACCESS_DENIED);
    }
    const leagueListQuery = `select leagues.id,league_name as name from leagues join users on leagues.organizer_id = users.id where email = $1`;
    const leagueList = await pool.query(leagueListQuery, [ownerEmail]);
    return leagueList.rows;
  } catch (e) {
    throw new AppError(
      e.message || "Error deleting the league",
      e.statusCode || 401
    );
  }
}


const getLeagueNamesByStatistician = async (userId) => {
  try {
      if (!userId) {
          throw new AppError(UNAUTHORIZED.ACCESS_DENIED, 401);
      }

      const leagueListQuery = `
          SELECT leagues.id, league_name AS name
          FROM leagues
          JOIN league_emp ON leagues.id = league_emp.league_id
          JOIN employee_roles er ON er.employee_id = league_emp.id
          WHERE er.role_id = 2 AND league_emp.user_id = $1;
      `;

      const leagueList = await pool.query(leagueListQuery, [userId]);
      return leagueList.rows;
  } catch (e) {
      throw new AppError(e.message || "Error finding leagues", e.statusCode || 500);
  }
};


const getLeagueStats = async (teamId) => {
  const leagueQuery = `SELECT l.id FROM leagues l JOIN teams t ON t.league_id = l.id WHERE t.id=$1`;

  const result = await pool.query(leagueQuery, [teamId]);

  if (result.rows.length === 0) {
    throw new Error("Team not found in any league");
  }
  // const leagueId = result.rows[0].id;
  const leagueId = 1;
  const topGoalScorers = `
    WITH TopScorers AS (
      SELECT 
          us.user_id, 
          u.picture_url,
          SUM(us.goals) AS "totalGoals" 
      FROM user_stats us
      JOIN users u ON us.user_id = u.id
      JOIN teams t ON u.team_id = t.id
      JOIN matches m ON m.id = us.match_id 
      WHERE t.league_id = $1
      AND m.match_time >= NOW() - INTERVAL '7 years'
      GROUP BY us.user_id, u.picture_url
      ORDER BY "totalGoals" DESC
      LIMIT 10
    )
    SELECT 
        us.user_id as "userId", 
        u.first_name as "firstName", 
        u.picture_url as "pictureUrl",
        SUM(us.goals) AS "totalGoals" 
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    JOIN teams t ON u.team_id = t.id
    JOIN matches m ON m.id = us.match_id 
    JOIN TopScorers ts ON us.user_id = ts.user_id
    WHERE t.league_id = $1  
    AND m.match_time >= NOW() - INTERVAL '7 years'
    GROUP BY us.user_id, u.first_name, u.picture_url
    ORDER BY "totalGoals" DESC;   

  `;

  const topScorersResult = await pool.query(topGoalScorers, [leagueId]);

  const processedTopScorers = await Promise.all(
    topScorersResult.rows.map(async (user) => {
      const pictureUrl = user.pictureUrl
        ? await getObjectSignedUrl(user.pictureUrl)
        : await getObjectSignedUrl(DEFAULT_PROFILE_PICTURE);

      return {
        ...user,
        pictureUrl,
      };
    })
  );

  return { topGoalScorers: processedTopScorers };
};


const getLeaguePointsTable = async (leagueId) => {
  try{
    const teamsList = await pool.query(`
      WITH match_scores AS (
        SELECT 
            m.id AS match_id,
            u.team_id AS team_id,
            t.name AS team_name,
            COALESCE(SUM(us.goals), 0) AS total_goals
        FROM matches m
        JOIN users u ON u.team_id IN (m.home_team_id, m.away_team_id)
        JOIN teams t ON u.team_id = t.id
        LEFT JOIN user_stats us ON us.user_id = u.id AND us.match_id = m.id
        GROUP BY m.id, u.team_id, t.name
        ),
        match_results AS (
            SELECT 
            ms1.match_id,
            ms1.team_id AS team_id,
            ms1.team_name,
            ms1.total_goals,
            ms2.team_id AS opponent_team_id,
            ms2.total_goals AS opponent_goals,
            CASE 
                WHEN ms1.total_goals > ms2.total_goals THEN 3
                WHEN ms1.total_goals = ms2.total_goals THEN 1
                ELSE 0
            END AS points
        FROM match_scores ms1
        JOIN match_scores ms2 ON ms1.match_id = ms2.match_id AND ms1.team_id != ms2.team_id
        )
        SELECT 
            t.id AS team_id,
            t.name AS team_name,
          t.logo_url as team_logo,
            COALESCE(SUM(mr.points), 0) AS total_points,
            COUNT(mr.match_id) AS matches_played,
            SUM(CASE WHEN mr.points = 3 THEN 1 ELSE 0 END) AS wins,
            SUM(CASE WHEN mr.points = 1 THEN 1 ELSE 0 END) AS draws,
            SUM(CASE WHEN mr.points = 0 THEN 1 ELSE 0 END) AS losses
        FROM teams t
        LEFT JOIN match_results mr ON t.id = mr.team_id
        WHERE t.league_id = $1
        GROUP BY t.league_id, t.id, t.name
        ORDER BY total_points DESC, wins DESC;
      `,[leagueId]);
    let teams = teamsList.rows;
    await Promise.all(
      teams.map(async (team) => {
        const url = team.team_logo
            ? await getObjectSignedUrl(team.team_logo)
            : null
        team.team_logo = url
        return team;
      })
    );
    return teams;
  }catch(e){
    throw new AppError(e.message || 'Unknown Error', e.statusCode || 500);
  }
}

module.exports = {
  updateLeague,
  getAllLeagues,
  getLeague,
  createLeague,
  updateLeague,
  uploadLeagueLogo,
  deleteLeague,
  getLeagueNamesByOwner,
  getLeagueNamesByStatistician,
  getLeagueStats,
  getLeaguePointsTable
}

