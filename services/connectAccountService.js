const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {AppError, BAD_REQUEST} = require('../config/errorCodes')
const pool = require('../config/db')


const createConnectAccountLink = async (user) => {
  try {

    const query = await pool.query('Select first_name, last_name from users where email=$1 and owner_status=$2', [user.email, false])

    if(query.rows.length === 0){
      throw new AppError("Already League Owner", 400) // stop the user from going forward
    }

    const account = await stripe.accounts.create({
      type: "express",
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}`,
      return_url: `${process.env.FRONTEND_URL}`,
      type: "account_onboarding",
    });

    await pool.query('UPDATE public.users SET account_id=$1 WHERE email=$2', [account.id, user.email])

    return { url: accountLink.url, accountId: account.id };
  } catch (e) {
    throw new AppError(e.message || BAD_REQUEST.UNKNOWN_ERROR, e.statusCode || 401);
  }
};

module.exports = {
    createConnectAccountLink,
}