const employeeService = require('../services/employeeService')

const getLeagues = async (req, res, next) => {
    try{
        const employees = await employeeService.getEmployees(req.user, req.params.leagueId);
        res.status(200).json({
            employees: employees
        });
    }catch(e){
        next(e);
    }
}

const assignEmployeeToLeague = async (req, res, next) => {
    try{
        
        await employeeService.assignEmployeeToLeague(req.body.email, req.body.role, req.params.leagueId);
        res.status(200).json({
            message : "Employee Assigned Successfully"
        });
    }catch(e){
        next(e);
    }
}
const getAdminDashboardStats = async (req,res,next)=>{
    try{
        dashboardStats = await employeeService.getAdminDashboardStats(req.user)
        res.status(200).json({stats:dashboardStats})
    }catch(e){
        next(e);
    }
}
const getFilteredEmployees = async (req, res,next) => {
    try {
      const { league, role, name } = req.query;  
  
      employees = await employeeService.getFilteredEmployees(req.user,league,role,name)
  
      res.json(employees);  
    } catch (err) {
      res.status(500).send('Error fetching employees');
    }
  };

const getLeaguesEmployeesIn = async (req, res, next) => {
    try{
        const leagueIds = await employeeService.getLeaguesEmployeesIn(req.user.email);
        res.status(200).json({
            leagueIds
        });
    }catch(e){
        next(e);
    }
}

module.exports = {
    getLeagues,
    assignEmployeeToLeague,
    getAdminDashboardStats,
    getFilteredEmployees,
    getLeaguesEmployeesIn
}