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
            success_url: `${process.env.FRONTEND_URL}/success-team-creation`,
            cancel_url: `${process.env.FRONTEND_URL}/fail-onboarding`,
            
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
        // Get the balance before the paid out.
        const query = await pool.query('SELECT account_id FROM users WHERE email=$1 and owner_status=$2', [email, true])
        const balance = await stripe.balance.retrieve({
            stripeAccount: query.rows[0].account_id
        });

        return balance.available[0]?.amount || 0;
    } catch (e) {
        throw new AppError("Failed to fetch balance", 400);
    }
}

const calculateRefundAmount = async (leagueId) => {
    try {
        // Fetch total number of teams and sum of completed transactions in a single query
        const result = await pool.query(
            `SELECT COALESCE(SUM(tr.amount), 0) as total_amount FROM transactions tr WHERE team_id IN (SELECT id FROM teams WHERE league_id=$1)`,[leagueId]
        );

        const baseRefundAmount = parseFloat(result.rows[0].total_amount) || 0;
        const totalAmount = baseRefundAmount + baseRefundAmount * 0.03;
        return totalAmount;
    } catch (e) {
        throw new AppError("Unknown Error", 500);
    }
};

const refund = async(intentId, amount, teamDeletion) => {
    try {
        if (teamDeletion) {
            amount = Math.round(amount * 0.97);
        }

        await stripe.refunds.create({
            payment_intent: intentId,
            amount: amount // into cents for the return
        });

    } catch (e) {
        console.log(e)
        throw new AppError("Unable to Process the Refund", 500);
    }
}

module.exports = {
    checkoutSession,
    getAccountBalance,
    refund,
    calculateRefundAmount
}