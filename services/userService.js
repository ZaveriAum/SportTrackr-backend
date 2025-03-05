const pool = require('../config/db')
const DEFAULT_PROFILE_PICTURE='defualts/default_profile_photo.jpeg'
const {AppError, BAD_REQUEST} = require('../utilities/errorCodes')
const {getObjectSignedUrl, uploadFile, deleteFile} = require('./s3Service')
const bcrypt = require('bcrypt')

const getUserProfile = async (email) => { 

    try {

        const result = await pool.query(`
          SELECT 
          u.id, u.first_name , u.last_name, u.picture_url, u.profile_visibility,
          t.id as teamid, t.name as teamName, t.logo_url teamLogoUrl,
          l.league_name as leagueName, l.logo_url as leagueLogoUrl
          FROM users u
          JOIN teams t
          ON u.team_id = t.id 
          JOIN leagues l
          ON t.league_id = l.id
          WHERE email = $1`, [email]);

        const user = result.rows[0];
        if (!user) {
            throw new AppError(BAD_REQUEST.USER_NOT_EXISTS, 400)
        }

        const pictureUrl = user.picture_url
          ? await getObjectSignedUrl(user.picture_url)
          : null

        const teamLogoUrl = user.teamlogourl
          ? await getObjectSignedUrl(user.teamlogourl)
          : null

        const leagueLogUrl = user.leaguelogourl
          ? await getObjectSignedUrl(user.leaguelogourl)
          : null

          const userStats = await pool.query(`
          SELECT 
            SUM(us.goals) AS total_goals,
            SUM(us.shots) AS total_shots,
            SUM(us.assists) AS total_assists,
            SUM(us.saves) AS total_saves,
            SUM(us.interceptions) AS total_interceptions,
            SUM(us.yellow_card) AS total_yellow_cards,
            SUM(us.red_card) AS total_red_cards
          FROM user_stats us
          JOIN matches m ON us.match_id = m.id
          WHERE (m.home_team_id = $1 OR m.away_team_id = $1)
          AND us.user_id = $2
          GROUP BY us.user_id;
          `, [user.teamid, user.id])
        
        return {
            firstName: user.first_name,
            lastName: user.last_name,
            pictureUrl: pictureUrl,
            profileVisibility: user.profile_visibility,
            teamName: user.teamname,
            teamLogo: teamLogoUrl,
            leagueName: user.leaguename,
            leagueLogo: leagueLogUrl,
            totalGoals: userStats.rows[0].total_goals,
            totalShots: userStats.rows[0].total_shots,
            totalAssists: userStats.rows[0].total_assists,
            totalSaves: userStats.rows[0].total_saves,
            totalInterceptionL: userStats.rows[0].total_interceptions,
            totalYellowCards: userStats.rows[0].total_yellow_cards,
            totalRedCards: userStats.rows[0].total_red_cards
        }
    } catch (e) {
        throw new AppError('Unknown Error', 500)
    }
}

const getUserById = async (id) => {
    try{
        const user = await pool.query('SELECT first_name, last_name, picture_url FROM users WHERE id=$1', [id]);
        
        const pictureUrl = user.picture_url
        ? await getObjectSignedUrl(user.picture_url)
        : await getObjectSignedUrl(DEFAULT_PROFILE_PICTURE);
        
        return {
            firstName: user.rows[0].first_name,
            lastName: user.rows[0].last_name,
            pictureUrl: pictureUrl,
        }

    }catch(e){
      
        throw new AppError("Cannot get User", 400);
    }
}

const updateUserProfile = async (email, firstName, lastName) => {
  try {
    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2 WHERE email = $3",
      [firstName, lastName, email]
    );
  } catch (e) {
    throw new AppError("Unable to update the profile", 400);
  }
};

const updateUserPassword = async (email, body) => {
  try {
    const { oldPassword, newPassword, newConfirmPassword } = body;
    const result = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new AppError("Invalid old password", 400);
    }

    if (newPassword !== newConfirmPassword) {
      throw new AppError(BAD_REQUEST.PASSWORD_MISMATCH, 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
  } catch (e) {
    throw new AppError(
      e.message || "Unable to Change Password",
      e.statusCode || 401
    );
  }
};

const uploadProfilePhoto = async (email, file) => {
  try {
    if (!file) {
      throw new AppError("No file uploaded", 400);
    }
    const user = await pool.query(
      "SELECT picture_url FROM users WHERE email=$1",
      [email]
    );

    const { buffer, originalname, mimetype } = file;

    const key = await uploadFile(
      buffer,
      originalname,
      mimetype,
      "profile-photo"
    );

    // If there is a picture url then delete the image from s3
    if (user.rows[0].picture_url) {
      await deleteFile(user.rows[0].picture_url);
    }

    await pool.query("UPDATE users SET picture_url = $1 WHERE email = $2", [
      key,
      email,
    ]);
  } catch (e) {
    throw new AppError(
      e.message || "Unable to upload Profile Photo",
      e.statusCode || 400
    );
  }
};

const getFilteredUsers = async (user, leagueId, teamId, name) => {
    const filteredUsersQuery = `
  SELECT 
    CONCAT(u.first_name, ' ', u.last_name) AS "fullName",
    l.league_name AS "league",       
    t.name AS "team",
    u.picture_url as pictureUrl,
    COUNT(DISTINCT m.id) AS "totalMatchesPlayed", 
    (SELECT position_played 
     FROM user_stats us
     WHERE us.user_id = u.id
     GROUP BY us.position_played
     ORDER BY COUNT(us.position_played) DESC
     LIMIT 1) AS "positionPlayed"
  FROM users u
  JOIN teams t 
    ON u.team_id = t.id
  JOIN leagues l 
    ON t.league_id = l.id  
  LEFT JOIN matches m 
    ON (m.home_team_id = t.id OR m.away_team_id = t.id)  
  LEFT JOIN user_stats us 
    ON u.id = us.user_id  
  WHERE 
    (CAST($1 AS INTEGER) IS NULL OR t.league_id = $1)  
    AND (
      CAST($2 AS TEXT) IS NULL OR CONCAT(u.first_name, ' ', u.last_name) ILIKE '%' || CAST($2 AS TEXT) || '%'
    )
    AND (
      CAST($3 AS INTEGER) IS NULL OR u.team_id = $3 
    )
  GROUP BY u.id, l.league_name, t.name, u.picture_url;
      `;
  
    if (!leagueId) leagueId = null;
    if (!teamId) teamId = null;
    if (!name) name = null;
  
    try {
      const filteredUsers = await pool.query(filteredUsersQuery, [
        leagueId,
        name,
        teamId,
      ]);
  
      const users = await Promise.all(
        filteredUsers.rows.map(async (user) => {
          return {
            fullName: user.fullName,
            league: user.league,
            matches: user.totalMatchesPlayed,  
            position: user.positionPlayed,    
            teamName: user.team,
            signedUrl: user.pictureUrl
              ? await getObjectSignedUrl(user.pictureUrl)
              : await getObjectSignedUrl(DEFAULT_PROFILE_PICTURE),
          };
        })
      );
  
      return users;
    } catch (error) {
      throw new AppError("Failed to fetch filtered users", 400);
    }
  };
  
  const toggleProfile = async (email) => {
    try{
      const user = await pool.query('Select profile_visibility FROM users WHERE email = $1', [email])
      await pool.query(`UPDATE users
                        SET profile_visibility=$1
	                      WHERE email = $2`,[ !user.rows[0].profile_visibility, email])
    }catch(e){
      throw new AppError(e.message || "Unknown Error", e.statusCode || 400)
    }
  }

module.exports = {
    getUserProfile,
    getUserById,
    updateUserProfile,
    updateUserPassword,
    uploadProfilePhoto,
    getFilteredUsers,
    toggleProfile
}
