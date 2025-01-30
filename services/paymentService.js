const pool = require('../config/db');
const {AppError} = require('../utilities/errorCodes')
const stripe = require('../config/stripe')

const checkoutSession = async(account_id, teamId, teamName, leaguePrice) => {
    try{
        const expirationTime = Math.floor(Date.now() / 1000) + (30 * 60); // 30 minutes for now

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'cad',
                    product_data: { name: teamName },
                    unit_amount: leaguePrice * 100
                },
                quantity: 1,
            }],
            payment_intent_data: {
                application_fee_amount: 0,
                transfer_data: {
                    destination: account_id
                }
            },
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
            
            payment_method_types: ['card'],
            
            metadata: {
                teamId: teamId.toString()
            },

            expires_at: expirationTime
        });

        await pool.query('INSERT INTO transactions (charge_id, amount, team_id, status) VALUES ($1, $2, $3, $4)',[session.id, leaguePrice, teamId, 'pending']);

        return session.url;
    }catch(e){
        await pool.query('DELETE FROM public.teams WHERE id=$1', [teamId])
        throw new AppError(e.message || 'Internal Server Error',e.statusCode || 500)
    }
}

module.exports = {
    checkoutSession
}