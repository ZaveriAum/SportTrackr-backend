const { pool } = require('../config/db');
const {AppError} = require('../utilities/errorCodes')
const stripe = require('../config/stripe')

const checkoutSession = async(teamId, teamName, leaguePrice) => {
    try{
        const session = await stripe.checkout.session.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
            line_items: [{
            price_data: {
                currency: 'cad',
                product_data: { name: teamName },
                unit_amount: leaguePrice
            },
            quantity: 1,
            }],
            metadata: {
                teamId: teamId.toString()
            }
        });

        await pool.query('INSERT INTO transactions (charge_session_id, intent_id, amount, team_id, status) VALUES ($1, $2, $3, $4, $5)',[session.id, session.payment_intent, leaguePrice, teamId, 'pending']);

        return session.url;
    }catch(e){
        throw new AppError(e.message || 'Internal Server Error',e.statusCode || 500)
    }
}

module.exports = {
    checkoutSession
}