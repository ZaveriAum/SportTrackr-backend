require('dotenv').config();
const pool = require('../config/db');
const {AppError, UNAUTHORIZED, BAD_REQUEST} = require('../utilities/errorCodes')
const {findLeagueRoles} = require('./authService')

const getEmployees = async (user, leagueId) => {
    try {
        // Check if the user has the appropriate roles
        if (user.roles.includes('owner') || user.roles.includes('admin')) {
            const employees = await pool.query(
                'SELECT u.email, u.first_name, u.last_name FROM users u JOIN league_emp le ON u.id = le.user_id WHERE le.league_id = $1',
                [leagueId]
            );

            // If there are employees in the result
            if (employees.rows.length > 0) {
                // Use Promise.all to resolve all promises
                const emps = await Promise.all(
                    employees.rows.map(async (emp) => {
                        emp.league_role = await findLeagueRoles(emp.email);
                        return emp;
                    })
                );
                return emps; // Return the resolved employees
            } else {
                return []; // Return an empty array if no employees
            }
        }

        throw new AppError("Access Denied", 401); // Throw error for unauthorized access
    } catch (e) {
        // Handle errors
        throw new AppError(`${e.message}` || "Unknown Error", e.statusCode || 500);
    }
};

const assignEmployeeToLeague = async (email, role, leagueId) => {
    try {

        await pool.query('BEGIN');

        // Fetch role_id from league_roles where role_name matches user input role
        const roleId = await pool.query('SELECT id FROM league_roles WHERE role_name = $1', [role]);

        if (!roleId) {
            throw new AppError('Role does not exist.', 404);
        }

        const userId = await pool.query('SELECT id FROM users WHERE email = $1', [email])

        if (!userId){
            throw new AppError(BAD_REQUEST.USER_NOT_EXISTS, 400)
        }
        

        // get the userId from the email given

        const leagueEmpResult = await pool.query(
            `
            INSERT INTO league_emp (user_id, league_id)
            VALUES ($1, $2)
            RETURNING id;
            `,
            [userId.rows[0].id, leagueId]
        );
    
        const leagueEmpId = leagueEmpResult.rows[0].id;
    
        await pool.query(
            `
            INSERT INTO employee_roles (role_id, employee_id)
            VALUES ($1, $2);
            `,
            [roleId.rows[0].id, leagueEmpId]
        );

        await pool.query('COMMIT');
    } catch (e) {
        await pool.query('ROLLBACK');
        throw new AppError(e.message || 'Unknown Error', e.statusCode || 500);
    }
};


module.exports = {
    getEmployees,
    assignEmployeeToLeague
}