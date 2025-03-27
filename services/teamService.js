require("dotenv").config();
const pool = require("../config/db");
const DEFAULT_PROFILE_PICTURE='defualts/default_profile_photo.jpeg'
const { AppError, UNAUTHORIZED, BAD_REQUEST, FORBIDDEN } = require("../utilities/errorCodes");

const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");
const { checkoutSession } = require('./paymentService')
const bcrypt = require("bcrypt");
const {refund} = require('./paymentService')
const {sendTeamDeletionToOwner, sendTeamDeletionToPlayer, sendRefundConfirmationToOwner} = require('./mailService')

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

    if (teamVisibility===false && !password) {
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

    const userId = await pool.query('SELECT id FROM users WHERE email=$1', [user.email])

    const values = [
      name,
      leagueId,
      description,
      userId.rows[0].id,
      userId.rows[0].id,
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
    
    // Add team id for that user
    await pool.query('UPDATE users SET team_id=$1 WHERE email=$2', [team.rows[0].id, user.email])
    
    const query = await pool.query('SELECT price, organizer_id FROM leagues WHERE id=$1', [leagueId])

    const account_id = await pool.query('SELECT account_id FROM users WHERE id=$1', [query.rows[0].organizer_id])

    return await checkoutSession(account_id.rows[0].account_id, team.rows[0].id, team.rows[0].name, query.rows[0].price);

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
      password = teamToUpdate.password
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
      homeColor,
      awayColor,
      teamLogoUrl,
      teamVisibility,
      teamId,
      password
    ];

    const updateQuery = `
    UPDATE teams
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      home_color = COALESCE($3, home_color),
      away_color = COALESCE($4, away_color),
      logo_url = COALESCE($5, logo_url),
      team_visibility = COALESCE($6, team_visibility),
      password = COALESCE($7, password)
    WHERE id = $8
    RETURNING *;
  `;

    const updatedTeam = await pool.query(updateQuery, values);
    updatedTeam.rows[0].logoUrl = updatedTeam.rows[0].logoUrl ? getObjectSignedUrl(updatedTeam.rows[0].logoUrl) : null;

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
  ) AS "matchesPlayed",
  l.league_name AS "leagueName" 
FROM 
  teams t
LEFT JOIN 
  users u ON t.owner_id = u.id
LEFT JOIN 
  leagues l ON t.league_id = l.id  
WHERE 
  t.league_id = $1;
    `;
    const result = await pool.query(teamsQuery, [leagueId]);


    const teams = await Promise.all(
      result.rows.map(async (team) => {
        const signedUrl = team.logoUrl ? await getObjectSignedUrl(team.logoUrl) : null;
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
        t.owner_id,
        t.league_id,
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
    
    const teamTransaction = await pool.query('SELECT status FROM transactions WHERE team_id=$1', [teamId]);

    if (teamTransaction.rows[0].status !== "success"){
      throw new AppError("Team Creation Incomplete", 401);
    }

    if (result.rows.length === 0) {
      return new AppError(BAD_REQUEST.TEAM_NOT_EXISTS)
    }

    const team = result.rows[0];
    const signedUrl = team.logoUrl ? await getObjectSignedUrl(team.logoUrl) : null;
    const { logoUrl, ...teamWithoutLogoUrl } = team;
    return { ...teamWithoutLogoUrl, signedUrl };

  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

const getTeamByLeagueOwner = async(userEmail) =>{
 if(!userEmail){
  throw new AppError(FORBIDDEN.FORBIDDEN)
 }
 const teamsQuery = `SELECT t.id, t.name FROM teams t JOIN leagues l ON l.id = t.league_id JOIN users u ON l.organizer_id = u.id WHERE u.email=$1`
 const teams = await pool.query(teamsQuery,[userEmail])
 return teams.rows
}

const deleteTeam = async(email, teamId)=>{
  let transactionStarted = false;
  try{
    // getting the id from users using email get the owner_id from teamId now check if both are same then move
    // further else throw new error
    const query = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    const query2 = await pool.query('SELECT owner_id, league_id FROM teams WHERE id=$1', [teamId])

    if (query.rows[0].id !== query2.rows[0].owner_id)
      throw new AppError(`${UNAUTHORIZED.ACCESS_DENIED}`, 401)

    // Check if league has already started Team can only be deleted 5 days before the leagues get started
    const query3 = await pool.query('SELECT start_time FROM leagues WHERE id=$1', [query2.rows[0].league_id])

    const startTime = new Date(query3.rows[0].start_time);
    const fiveDaysBeforeStart = new Date(startTime);
    fiveDaysBeforeStart.setDate(startTime.getDate() - 5);
    const now = new Date();

    if (now >= fiveDaysBeforeStart)
      throw new AppError("Deletion Timeline Has Passed", 400);

    // Now for refund get the transaction information from the teamId
    const query4 = await pool.query('SELECT intent_id, amount FROM transactions WHERE team_id=$1', [teamId]);

    if (query4.rowCount === 0){
      throw new Error("No successful transaction found for this team.");
    }
    const transaction = query4.rows[0];

    // Now process the refund

    // Delete the team logo
    const team = await pool.query('SELECT logo_url, owner_id, captain_id, name FROM teams WHERE id=$1', [teamId]);
    if (team.rows[0].logo_url)
      await deleteFile(team.rows[0].logo_url);    
    transactionStarted = true;

    const trans = await pool.query('DELETE FROM transactions WHERE team_id=$1 RETURNING *', [teamId])

    await pool.query('BEGIN');

    const team_players = await pool.query('SELECT email, first_name, last_name FROM users WHERE team_id=$1',[teamId])
    const owner_email = await pool.query('SELECT email, first_name, last_name FROM users WHERE id=$1', [team.rows[0].owner_id])
    const captain_email = await pool.query('SELECT email, first_name, last_name FROM users WHERE id=$1', [team.rows[0].captain_id])
    
    await sendTeamDeletionToOwner(owner_email.rows[0].email, `${owner_email.rows[0].first_name} ${owner_email.rows[0].last_name}`, team.rows[0].name);
    await sendRefundConfirmationToOwner(owner_email.rows[0].email, `${owner_email.rows[0].first_name} ${owner_email.rows[0].last_name}`, trans.rows[0].charge_id, trans.rows[0].amount);
    team_players.rows.forEach(async (player)=>{
      await sendTeamDeletionToPlayer(player.email, `${player.first_name} ${player.last_name}`, "Team Owner Has successfully deleted the team.", "Team Deleted");
    });
    if(owner_email.rows[0].email !== owner_email.rows[0].email){
      await sendTeamDeletionToPlayer(captain_email.rows[0].email, `${captain_email.rows[0].first_name} ${captain_email.rows[0].last_name}`, "Team Owner Has successfully deleted the team.", "Team Deleted");
    }
    
    await pool.query('UPDATE users SET team_id=$1 WHERE email=$2', [null, email])
    
    await pool.query('DELETE FROM teams WHERE id=$1', [teamId])
    

    await refund(transaction.intent_id, transaction.amount * 100, true);


    await pool.query('COMMIT')

  }catch(e){
    if (transactionStarted) await pool.query('ROLLBACK');
    throw new AppError(e.message || 'Unable to delete the team', e.statusCode || 401)
  }
}

const getTeamPlayersByLeagueId = async (leagueId) => {
  try {
    if (!leagueId) {
      throw new AppError("League ID is required", 400);
    }

    const teamsQuery = `
      SELECT 
          t.id, 
          t.name,
          t.logo_url AS "logoUrl", 
          t.team_visibility AS "teamVisibility", 
          t.password AS "teamPassword",
          CONCAT(u.first_name, ' ', u.last_name) AS "ownerName",
          o.id AS "ownerId",
          o.picture_url AS "ownerLogoUrl",
          CONCAT(c.first_name, ' ', c.last_name) AS "captainName",
          c.id AS "captainId",
          c.picture_url AS "captainLogoUrl",
          l.league_name AS "leagueName",
          -- Get players excluding owner and captain
          json_agg(
              DISTINCT jsonb_build_object(
                  'id', p.id,
                  'name', CONCAT(p.first_name, ' ', p.last_name),
                  'logoUrl', p.picture_url
              )
          ) AS "players"
      FROM 
          teams t
      LEFT JOIN 
          users u ON t.owner_id = u.id  -- Owner details
      LEFT JOIN 
          users o ON t.owner_id = o.id  -- Owner details (repeating for clarity)
      LEFT JOIN 
          users c ON t.captain_id = c.id  -- Captain details
      LEFT JOIN 
          leagues l ON t.league_id = l.id  
      LEFT JOIN 
          users p ON t.id = p.team_id AND p.id != t.owner_id AND p.id != t.captain_id  -- Exclude owner and captain from players
      WHERE 
          t.league_id = $1
      GROUP BY 
          t.id, u.first_name, u.last_name, l.league_name, o.id, o.picture_url, c.id, c.picture_url;
    `;
    const result = await pool.query(teamsQuery, [leagueId]);

    const teams = await Promise.all(
      result.rows.map(async (team) => {
        const teamLogoUrl = team.logoUrl ? await getObjectSignedUrl(team.logoUrl) : null;
        team.logoUrl = teamLogoUrl;

        const ownerLogoUrl = team.ownerLogoUrl ? await getObjectSignedUrl(team.ownerLogoUrl) : null;
        team.ownerLogoUrl = ownerLogoUrl;

        const captainLogoUrl = team.captainLogoUrl ? await getObjectSignedUrl(team.captainLogoUrl) : null;
        team.captainLogoUrl = captainLogoUrl;

        team.players = await Promise.all(
          team.players.map(async (player) => {
            const playerLogoUrl = player.logoUrl ? await getObjectSignedUrl(player.logoUrl) : null;
            player.logoUrl = playerLogoUrl;
            return player;
          })
        );

        return team;
      })
    );

    return teams;
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
};

const joinTeam = async (user, teamId, password)=>{
  try{
    if (user.teamId === teamId || user.teamId)
      throw new AppError("Already in Team", 400);

    const leagueTimings = await pool.query(`SELECT l.end_time, t.team_visibility, t.password FROM leagues l JOIN teams t ON t.league_id = l.id WHERE t.id = $1`, [teamId]);

    if((!leagueTimings.rows[0].team_visibility && await bcrypt.compare(password,  leagueTimings.rows[0].password )) || leagueTimings.rows[0].team_visibility){

      const today = new Date();
      const endTime = new Date(leagueTimings.rows[0].end_time)
      
      if (today > endTime)
        throw new AppError("League is Finished", 400)

      await pool.query(`UPDATE users SET team_id=$1 WHERE email = $2`, [teamId, user.email])
    }else{
      throw new AppError("Invalid Password")
    }
  }catch(e){
    throw new AppError(e.message || "Unknow Error", e.statusCode || 500);
  }
}
const getTeamPlayers = async (teamId) => {
  try {
    const query = `
      SELECT 
        u.email, 
        u.first_name, 
        u.last_name,
        u.id,
        u.profile_visibility,
        u.picture_url,
        CASE 
            WHEN t.captain_id = u.id THEN 'true'
            ELSE 'false'
        END AS captain_status
      FROM 
        users u
      JOIN 
        teams t ON u.team_id = t.id
      WHERE 
        u.team_id = $1
    `;

    const results = await pool.query(query, [teamId]);

    const playersWithSignedUrls = await Promise.all(
      results.rows.map(async (user) => { 
        const signedUrl = user.picture_url
          ? await getObjectSignedUrl(user.picture_url) 
          : await getObjectSignedUrl(DEFAULT_PROFILE_PICTURE);

        return {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          id: user.id,
          pictureUrl: signedUrl, 
          captainStatus: user.captain_status, 
          profileVisibility:user.profile_visibility
        };
      })
    );

    return playersWithSignedUrls; 
  } catch (error) {
    console.error('Error fetching team players:', error);
    throw new Error('Failed to fetch team players');
  }
};



module.exports = {
  createTeam,
  updateTeam,
  getTeamsByLeagueId,
  getTeamById,
  getTeamByLeagueOwner,
  deleteTeam,
  getTeamPlayersByLeagueId,
  joinTeam,
  getTeamPlayers
};
