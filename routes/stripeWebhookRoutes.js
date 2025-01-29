require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_SECRET;
const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const {sendLeagueOwnerConfirmation, sendRequestCompletionLeagueOwnerEmail} = require('../services/mailService')

router.post('/connect_account_webhook', express.raw({ type: 'application/json' }), async (request, response, next) => {
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

module.exports = router;
