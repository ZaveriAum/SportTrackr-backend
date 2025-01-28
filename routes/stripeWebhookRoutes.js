require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_SECRET;
const express = require('express');
const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  let event = request.body;

  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(request.body, signature, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed: ${err.message}`);
      return response.sendStatus(400);
    }
  }

  switch (event.type) {
    case "account.updated":
      const account = event.data.object;

      const chargesEnabled = account.charges_enabled;
      const requirementsDue = account.requirements.currently_due;
      
      console.log(`chargesEnabled: ${chargesEnabled}`);
      console.log("requirementsDue:", requirementsDue);

      if (chargesEnabled && requirementsDue.length === 0) {
        // Now when user are done with their status to complete then add the bycriped account id to the db
        // Send confirmation email of becoming a league owner
        console.log(event)
        console.log(`Account ${account.id} is fully active.`);
      } 

      if (account.details_submitted) {
        // When they complete the step 1. Then send an email with the verification link for the 
        if (account.requirements.currently_due && account.requirements.currently_due.length > 0) {
          try {
            const accountLink = await stripe.accountLinks.create({
              account: account.id,
              refresh_url: `${process.env.FRONTEND_URL}`,
              return_url: `${process.env.FRONTEND_URL}`,
              type: 'account_onboarding',
            });

            console.log("Account Link:", accountLink.url);

          } catch (error) {
            console.error("Failed to create account link:", error);
          }
        }
      }
      break;

    case "payment_intent.succeeded":
      console.log("Payment succeeded:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.send();
});

module.exports = router;
