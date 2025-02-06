require("dotenv").config();
const pool = require("../config/db");
const { AppError, UNAUTHORIZED, BAD_REQUEST } = require("../utilities/errorCodes");
const { toCamelCase } = require("../utilities/utilities");
const { uploadFile, deleteFile, getObjectSignedUrl } = require("./s3Service");
const DEFAULT_LEAGUE_LOGO = 'defualts/default_league_photo.png'
const {refund, calculateRefundAmount, getAccountBalance} = require('./paymentService')
const { sendTeamDeletionToOwner, sendRefundConfirmationToOwner, sendTeamDeletionToPlayer,
   sendLeagueOwnerRefund, sendLeagueOwnerDeletionConfirmation} = require('./mailService')

const getAllLeagues = async () => {
  try {
    console.log("Here")
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
            : await getObjectSignedUrl(DEFAULT_LEAGUE_LOGO)
        
        league.logo_url = url
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
            : await getObjectSignedUrl(DEFAULT_LEAGUE_LOGO)
        
    league.logo_url = url
    return toCamelCase(league) ;
  } catch (e) {
    throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
  }
}

const createLeague = async (email, roles, data, file) => {
  try {
    if (roles.includes('owner')) {
      const {
        leagueName,
        teamStarterSize,
        price,
        maxTeamSize,
        gameAmount,
        startTime,
        endTime,
        description
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

      const user = await pool.query('SELECT id FROM users WHERE email=$1', [email]);

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
        description
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
const updateLeague = async(user, leagueId, body) => {
    try{

        if (user.roles.includes('owner') || user.roles.includes('admin')){
            // Check if league exists
            const league = await pool.query('Select organizer_id, league_name FROM leagues WHERE id = $1', [leagueId]);

            const {leagueName} = body;

            if(league.rows.length === 0){
                throw new AppError("League does not exists", 400)
            }

            if(league.rows[0].organizer_id !== user.id){
              throw new AppError(BAD_REQUEST.ACCESS_DENIED, 401)
            }

            await pool.query('UPDATE public.leagues SET league_name=$1 WHERE id = $2', [leagueName, leagueId])
        }else{
            throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400)
        }

    }catch(e){
      throw new AppError(e.message || 'Unable to update league',e.statusCode || 400)
    }
};

// delete the previous logo
const uploadLeagueLogo = async (user, file, leagueId) => {
    try{
        if (user.roles.includes('owner') || user.roles.includes('admin')){

          const league = await pool.query('SELECT organizer_id, logo_url FROM leagues WHERE id=$1', [leagueId])
          const employee = await pool.query('SELECT id FROM league_emp WHERE user_id=$1 and league_id=$2', [user.id, leagueId])
          if(!file){
              throw new AppError('No file uploaded', 400);
          }

          if(league.rows[0].organizer_id !== user.id && employee.rows.length === 0){
            throw new AppError(BAD_REQUEST.ACCESS_DENIED, 401)
          }

          const { buffer, originalname, mimetype } = file;
          // Delete the previous logo.
          await deleteFile(league.rows[0].logo_url)
          // Upload the new logo
          const key = await uploadFile(buffer, originalname, mimetype, 'league-logos');
          await pool.query('UPDATE leagues SET logo_url = $1 WHERE id = $2', [key, leagueId]);
        }else{
            throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400)
        }
    }catch(e){
        throw new AppError(e.message || 'Unable to upload League Logo', e.statusCode || 400)
    }
}

const deleteLeague = async (email, roles, leagueId) => {

    try{
        if (roles.includes('owner')){

          // Check if User is the owner Of the league
          const league = await pool.query('SELECT organizer_id FROM leagues WHERE id=$1', [leagueId])
          const user = await pool.query('SELECT id FROM users WHERE email=$1', [email])

          if(league.rows[0].organizer_id !== user.rows[0].id)
            throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400);


          // Check if league has already started Team can only be deleted 5 days before the leagues get started
          const query = await pool.query('SELECT start_time, league_name FROM leagues WHERE id=$1', [leagueId])
          const leagueName = query.rows[0].league_name;
          const leagueOwner = await pool.query('SELECT email, first_name, last_name FROM users WHERE id=$1', [league.rows[0].organizer_id])

          const startTime = new Date(query.rows[0].start_time);
          const fiveDaysBeforeStart = new Date(startTime);
          fiveDaysBeforeStart.setDate(startTime.getDate() - 5);

          const teams = await pool.query('SELECT id from teams WHERE league_id=$1', [leagueId])

          const transactions = await pool.query(`SELECT intent_id, amount, team_id FROM transactions WHERE team_id IN (SELECT id FROM teams WHERE league_id=$1)`,[leagueId]);
          let totalAmount = 0;

          // Refund all the teams 
          transactions.rows.forEach(async (transaction)=>{
            totalAmount += transaction.amount;
            await refund(transaction.intent_id, transaction.amount * 100, false);
          });

          await sendLeagueOwnerDeletionConfirmation(leagueOwner.rows[0].email, `${leagueOwner.rows[0].first_name} ${leagueOwner.rows[0].last_name}` ,leagueName)
          await sendLeagueOwnerRefund(leagueOwner.rows[0].email, `${leagueOwner.rows[0].first_name} ${leagueOwner.rows[0].last_name}` ,leagueName, totalAmount);

          teams.rows.forEach(async(team)=>{

            let teamId = team.id;

            let te = await pool.query('SELECT logo_url, owner_id, captain_id, name FROM teams WHERE id=$1', [teamId]);
            if (te.rows[0].logo_url)
              await deleteFile(te.rows[0].logo_url);    
            transactionStarted = true;
        
            const trans = await pool.query('DELETE FROM transactions WHERE team_id=$1 RETURNING *', [teamId])
        
            await pool.query('BEGIN');
        
            const team_players = await pool.query('SELECT email, first_name, last_name FROM users WHERE team_id=$1',[teamId])
            const owner_email = await pool.query('SELECT email, first_name, last_name FROM users WHERE id=$1', [te.rows[0].owner_id])
            const captain_email = await pool.query('SELECT email, first_name, last_name FROM users WHERE id=$1', [te.rows[0].captain_id])
            
            await sendTeamDeletionToOwner(owner_email.rows[0].email, `${owner_email.rows[0].first_name} ${owner_email.rows[0].last_name}`, te.rows[0].name);
            await sendRefundConfirmationToOwner(owner_email.rows[0].email, `${owner_email.rows[0].first_name} ${owner_email.rows[0].last_name}`, trans.rows[0].charge_id, trans.rows[0].amount);
            team_players.rows.forEach(async (player)=>{
              await sendTeamDeletionToPlayer(player.email, `${player.first_name} ${player.last_name}`, "League Organizer Has successfully deleted the League", "League Deleted");
            });
            if(owner_email.rows[0].email !== owner_email.rows[0].email){
              await sendTeamDeletionToPlayer(captain_email.rows[0].email, `${captain_email.rows[0].first_name} ${captain_email.rows[0].last_name}`, "League Organizer Has successfully deleted the League", "League Deleted");
            }
          
          })


          // Delete employee roles for employees linked to the league
          await pool.query(`DELETE FROM employee_roles WHERE employee_id IN (SELECT id FROM league_emp WHERE league_id = $1)`,[leagueId]);
      
          // Delete employees linked to the league
          await pool.query(`DELETE FROM league_emp WHERE league_id = $1`,[leagueId]);
      
          // Delete teams linked to the league
          await pool.query(`DELETE FROM teams WHERE league_id = $1`,[leagueId]);
      
          // Delete the league
          const result = await pool.query( `DELETE FROM leagues WHERE id = $1 RETURNING logo_url`,[leagueId]);

          
          
          if (result.rows[0].logo_url)
            // Deleting the league logo
            deleteFile(result.rows[0].logo_url)

          await pool.query('COMMIT');
        }else{
          throw new AppError(BAD_REQUEST.ACCESS_DENIED, 400)
        }
    }catch(e){
        await pool.query('ROLLBACK');
        throw new AppError(e.message || 'Error deleting the league',e.statusCode || 401)
    }
}
module.exports = {
  updateLeague,
  getAllLeagues,
  getLeague,
  createLeague,
  updateLeague,
  uploadLeagueLogo,
  deleteLeague
}