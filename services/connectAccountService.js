const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { webhookSecret } = process.env;
const {AppError, BAD_REQUEST} = require('../config/errorCodes')


const createConnectAccountLink = async () => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}`,
      return_url: `${process.env.FRONTEND_URL}`,
      type: "account_onboarding",
    });

    return { url: accountLink.url, accountId: account.id };
  } catch (e) {
    throw new AppError(BAD_REQUEST.UNKNOWN_ERROR, 401);
  }
};

const accountAuthorizedWebhook = async (event, body) => {
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
    }

  switch (event.type) {
    case "account.authorized":
      console.log(event)
      console.log("Account authorized:", event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  // Return a 200 response to acknowledge receipt of the event
  response.send();
}

module.exports = {
    createConnectAccountLink,
    accountAuthorizedWebhook
}