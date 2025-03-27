const pool = require('../config/db')
const DEFAULT_PROFILE_PICTURE='defualts/default_profile_photo.jpeg'
const DEFAULT_LEAGUE_LOGO = "defualts/default_league_photo.png";
const DEFAULT_TEAM_LOGO = "defualts/default_team_logo.png";
const {AppError, BAD_REQUEST} = require('../utilities/errorCodes')
const {getObjectSignedUrl, uploadFile, deleteFile} = require('./s3Service')
const bcrypt = require('bcrypt')

const getUserProfile = async (email) => { 
  try {
      const result = await pool.query(`
          SELECT 
              u.id, u.first_name, u.last_name, u.picture_url, u.profile_visibility,
              t.id AS teamid, t.name AS teamName, t.logo_url AS teamLogoUrl,
              l.league_name AS leagueName, l.logo_url AS leagueLogoUrl,
              COALESCE(SUM(us.goals), 0) AS total_goals,
              COALESCE(SUM(us.shots), 0) AS total_shots,
              COALESCE(SUM(us.assists), 0) AS total_assists,
              COALESCE(SUM(us.saves), 0) AS total_saves,
              COALESCE(SUM(us.interceptions), 0) AS total_interceptions,
              COALESCE(SUM(us.yellow_card), 0) AS total_yellow_cards,
              COALESCE(SUM(us.red_card), 0) AS total_red_cards
          FROM users u
          LEFT JOIN teams t ON u.team_id = t.id
          LEFT JOIN leagues l ON t.league_id = l.id
          LEFT JOIN user_stats us ON us.user_id = u.id
          LEFT JOIN matches m ON us.match_id = m.id 
              AND (m.home_team_id = t.id OR m.away_team_id = t.id)
          WHERE u.email = $1
          GROUP BY u.id, t.id, t.name, t.logo_url, l.league_name, l.logo_url;
      `, [email]);

      const user = result.rows[0];
      if (!user) {
          throw new AppError(BAD_REQUEST.USER_NOT_EXISTS, 400);
      }

      const pictureUrl = user.picture_url ? await getObjectSignedUrl(user.picture_url) : null;
      const teamLogoUrl = user.teamlogourl ? await getObjectSignedUrl(user.teamlogourl) : null;
      const leagueLogoUrl = user.leaguelogourl ? await getObjectSignedUrl(user.leaguelogourl) : null;

      return {
          firstName: user.first_name,
          lastName: user.last_name,
          pictureUrl: pictureUrl,
          profileVisibility: user.profile_visibility,
          teamName: user.teamname || null,
          teamLogo: teamLogoUrl,
          leagueName: user.leaguename || null,
          leagueLogo: leagueLogoUrl,
          totalGoals: user.total_goals,
          totalShots: user.total_shots,
          totalAssists: user.total_assists,
          totalSaves: user.total_saves,
          totalInterceptions: user.total_interceptions,
          totalYellowCards: user.total_yellow_cards,
          totalRedCards: user.total_red_cards
      };
  } catch (e) {
      throw new AppError('Unknown Error', 500);
  }
};

const getUserProfileMobile = async (userId) => {
  try {
    const visibilityQuery = `SELECT profile_visibility FROM users WHERE id = $1`;
    const visibilityResult = await pool.query(visibilityQuery, [userId]);
    if (visibilityResult.rows.length === 0) {
      throw new Error("User not found");
    }
    const profileVisibility = visibilityResult.rows[0].profile_visibility;
    
    if (!profileVisibility) {
      return { message: "User's account is not public" };
    }
    const result = await pool.query(
      `WITH MostFrequentPosition AS (
          SELECT
              us.user_id,
              us.position_played,
              COUNT(*) AS position_count
          FROM
              user_stats us
          GROUP BY
              us.user_id, us.position_played
          ORDER BY
              position_count DESC
      )
      SELECT
          u.first_name AS "firstName",
          u.last_name AS "lastName", 
          t.logo_url AS "teamLogo", 
		  t.name  AS "teamName",
          l.logo_url AS "leagueLogo",
		  t.id as "teamId",
          u.email,
          u.picture_url, 
          SUM(us.goals) AS "totalGoals",
          SUM(us.assists) AS "totalAssists",
          SUM(us.shots) AS "totalShots",
          SUM(us.saves) AS "totalSaves",
          SUM(us.interceptions) AS "totalInterceptions",
          SUM(us.yellow_card) AS "totalYellowCards",
          SUM(us.red_card) AS "totalRedCards",
          COUNT(us.id) AS "numRows",
          mfp.position_played AS "mostFrequentPosition"
      FROM 
          users u
      JOIN 
          teams t ON u.team_id = t.id
      JOIN 
          leagues l ON t.league_id = l.id
      JOIN 
          user_stats us ON u.id = us.user_id
      LEFT JOIN 
          MostFrequentPosition mfp ON mfp.user_id = u.id
      WHERE 
          u.id = $1
      GROUP BY 
          u.id,t.name,t.id, u.first_name, u.last_name, t.logo_url, l.logo_url, mfp.position_played, u.picture_url
      LIMIT 1;`,
      [userId] 
    );


    const user = result.rows[0];
    if (!user) {
      throw new AppError(BAD_REQUEST.USER_NOT_EXISTS, 400);
    }

  
    

    const pictureUrl = user.picture_url
      ? await getObjectSignedUrl(user.picture_url)
      : await getObjectSignedUrl(DEFAULT_PROFILE_PICTURE);


    const teamLogoUrl = user.teamLogo
      ? await getObjectSignedUrl(user.teamLogo)
      : await getObjectSignedUrl(DEFAULT_TEAM_LOGO);

    const leagueLogoUrl = user.leagueLogo
      ? await getObjectSignedUrl(user.leagueLogo)
      : await getObjectSignedUrl(DEFAULT_LEAGUE_LOGO);

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      totalGoals: user.totalGoals,
      totalAssists: user.totalAssists,
      totalShots: user.totalShots,
      totalSaves: user.totalSaves,
      totalInterceptions: user.totalInterceptions,
      totalYellowCards: user.totalYellowCards,
      totalRedCards: user.totalRedCards,
      numRows: user.numRows,
      mostFrequentPosition: user.mostFrequentPosition,
      pictureUrl: pictureUrl,
      teamLogo: teamLogoUrl,
      teamId:user.teamId,
      teamName:user.teamName,
      leagueLogo: leagueLogoUrl,
    };
  } catch (e) {

    throw new AppError("Unknown Error", 500);
  }
};


const getUserById = async (id) => {
    try{
        const user = await pool.query('SELECT first_name, last_name, picture_url FROM users WHERE id=$1', [id]);
        
        const pictureUrl = user.picture_url
        ? await getObjectSignedUrl(user.picture_url)
        : null
        
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

    return await getObjectSignedUrl(key);
    
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
              : null
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
    getUserProfileMobile,
    getUserById,
    updateUserProfile,
    updateUserPassword,
    uploadProfilePhoto,
    getFilteredUsers,
    toggleProfile
}
