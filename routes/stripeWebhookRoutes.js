require("dotenv").config();
const stripe = require('../config/stripe');
const endpointSecret = process.env.WEBHOOK_SECRET;
const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const {sendLeagueOwnerConfirmation, sendRequestCompletionLeagueOwnerEmail, sendTeamCreationConfirmation, sendPaymentReceipt} = require('../services/mailService')

router.post('/connect-account-webhook', express.raw({ type: 'application/json' }), async (request, response, next) => {
  let event = request.body;

  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(request.body, signature, endpointSecret);
    } catch (e) {
      return response.status(400).json({
        message: e.message
      });
    }
  }

  switch (event.type) {
    case "account.updated":
      const account = event.data.object;

      const chargesEnabled = account.charges_enabled;
      const requirementsDue = account.requirements.currently_due;

      if (chargesEnabled && requirementsDue.length === 0) {
        // Now when user are done with their status to complete then add the bycriped account id to the db
        // Send confirmation email of becoming a league owner
        const query = await pool.query('UPDATE public.users SET owner_status=$1 WHERE account_id=$2 RETURNING first_name, last_name, email', [true, account.id])
        const user = query.rows[0]
        await sendLeagueOwnerConfirmation(user.email, `${user.first_name} ${user.last_name}`, process.env.FRONTEND_URL)
        // return // After this step user is completly authorized as a league owner
      } 

      if (account.details_submitted) {
          
        // Then send an email with the verification link for the 
        if (account.requirements.currently_due && account.requirements.currently_due.length > 0) {
          try {
            // Check user is not verified then only send the step two
            const query = await pool.query('Select first_name, last_name, email from users where account_id=$1 and owner_status=$2', [account.id, false])
            const user = query.rows[0]

            if(query.rows.length === 0){
              return // stop the user from going forward
            }
            const accountLink = await stripe.accountLinks.create({
              account: account.id,
              refresh_url: `${process.env.FRONTEND_URL}`,
              return_url: `${process.env.FRONTEND_URL}`,
              type: 'account_onboarding',
            });

            await sendRequestCompletionLeagueOwnerEmail(user.email, `${user.first_name} ${user.last_name}`, accountLink.url)

          } catch (error) {
            console.error(error);
          }
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.send();
});

router.post('/payment-webhook', express.raw({ type: 'application/json' }), async (request, response, next) => {
  let event = request.body;

  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(request.body, signature, endpointSecret);
    } catch (e) {
      console.log(e);
    }
  }
  switch (event.type) {
    case 'checkout.session.completed': {
      try{
        const session = event.data.object;
        const paymentIntentId = session.payment_intent;
        const teamId = session.metadata.teamId;

        const transaction = await pool.query('UPDATE transactions SET status = $1, intent_id = $2 WHERE team_id = $3 RETURNING *', ['success', paymentIntentId, teamId]);
        const query = await pool.query('SELECT t.owner_id, t.name, l.league_name FROM teams t JOIN leagues l ON t.league_id = l.id');
        const user = await pool.query('SELECT first_name, last_name, email FROM users WHERE id=$1', [query.rows[0].owner_id])

        await sendTeamCreationConfirmation(user.rows[0].email, `${user.rows[0].first_name} ${user.rows[0].last_name}`,query.rows[0].name, query.rows[0].league_name, `${process.env.FRONTEND_URL}/app`)
        await sendPaymentReceipt(user.rows[0].email, `${user.rows[0].first_name} ${user.rows[0].last_name}`,query.rows[0].name, query.rows[0].league_name, transaction.rows[0].charge_id, new Date().toLocaleString("en-US", { timeZone: "America/New_York" }), transaction.rows[0].amount)
        break;
      }catch(e){
        console.log(e);
      }
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      try{
        const session = event.data.object;
        const teamId = session.metadata.teamId;

        // Delete the transaction first
        await pool.query('DELETE FROM transactions WHERE team_id = $1', [teamId]);
        
        // Delete the team
        await pool.query('DELETE FROM public.teams WHERE id = $1', [teamId]);
        break;
      }catch(e){
        console.log(e);
      }
    }
    case 'charge.dispute.created': {
      try{
        console.log("Disputed")
        const dispute = event.data.object;
        const chargeId = dispute.charge;
        const query = await pool.query('DELETE FROM transactions WHERE charge_id=$1 RETURNING team_id', [chargeId]);
        await pool.query('DELETE FROM teams WHERE id=$1', [query.rows[0].team_id]);
        break;
      }catch(e){
      }
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.send();
});

module.exports = router;
