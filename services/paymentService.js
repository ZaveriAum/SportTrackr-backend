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

const getAccountBalance = async(email) => {
    try{
        const query = await pool.query('SELECT account_id FROM users WHERE email=$1 and owner_status', [email, true])

        const balance = await stripe.balance.retrieve({
            stripeAccount: query.rows[0].account_id
        })

        return balance.available[0]?.amount || 0;
    } catch (error) {
        throw new AppError("Failed to fetch balance", 400);
    }
}

const calculateRefundAmount = async (leagueId) => {
    try {
        // Fetch total number of teams and sum of completed transactions in a single query
        const result = await pool.query(
            `COALESCE(SUM(tr.amount), 0) as total_amount 
             FROM teams t
             LEFT JOIN transactions tr ON t.team_id = tr.team_id AND tr.status = 'completed'
             WHERE t.league_id = $1`,
            [leagueId]
        );

        const totalAmount = parseFloat(result.rows[0].total_amount) || 0;

        return totalAmount * 100;
    } catch (error) {
        throw new AppError("Unknown Error", 500);
    }
};

const refund = async(intentId, amount, teamDeletion) => {
    try{
        if (teamDeletion)
            amount = Math.round(amount * 0.97 * 100);
        // Process the refund
        await stripe.refunds.create({
            payment_intent: intentId,
            amount: amount * 100,
        });
  
    }catch(e){
        console.log(e)
        throw new AppError("Unable to Process the Refund")
    }
}

module.exports = {
    checkoutSession,
    getAccountBalance,
    refund
}