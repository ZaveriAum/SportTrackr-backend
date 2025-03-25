const matchService = require("../services/matchService");

const updateMatch = async (req, res, next) => {
  try {
    const data = req.body;
    const leagueId = await matchService.updateMatch(req.user, data);

    res.status(200).json({
      message: "Match Updated Successfully",
      leagueId: leagueId, 
    });
  } catch (e) {
    next(e);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await matchService.getStats(req.user);
    res.status(200).json({
      stats: stats,
    });
  } catch (e) {
    next(e);
  }
};

const uploadHighlights = async (req, res, next) => {

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No video files uploaded." });
    }

    await matchService.uploadHighlights(req.user, req.files, req.body);
    res.json({ message: "Upload successful!" });
  } catch (error) {
    next(error);
  }
};
const getMatchDetails = async(req,res,next)=>{
  try{
    const matchId = req.params.id
    const matchDetails = await matchService.getMatchDetails(matchId)
    res.json(matchDetails)
  }
  catch{
    next(error);
  }
}

const getMatchesByLeagueId = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const matchesData = await matchService.getMatchesByLeagueId(leagueId);
    res.json(matchesData);
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Error fetching matches" });
  }
};

const getMatchesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const matchesData = await matchService.getMatchesByUser(userId);
    res.json(matchesData);
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Error fetching matches" });
  }
};

const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchData = await matchService.getMatchById(matchId);
    res.json(matchData);
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Error fetching matches" });
  }
};

const updateForfeited = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { forfeitedBy } = req.body; 

    if (!forfeitedBy) {
      return res.status(400).json({ error: "forfeitedBy is required." });
    }

    const matchData = await matchService.updateForfeited(matchId, forfeitedBy);
    res.json({ message: "Match forfeited status updated", match: matchData });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: error.message || "Error updating match forfeited status" });
  }
};


const createMatch = async (req, res) => {
  try {
    const {
      homeTeamId,
      awayTeamId,
      matchTime,
      refereeId,
      statisticianId,
      leagueId
    } = req.body;

    if (!homeTeamId || !awayTeamId || !matchTime || !refereeId || !statisticianId || !leagueId) {
      return res.status(400).json({ error: "All parameters are required: homeTeamId, awayTeamId, matchTime, refereeId, statisticianId, leagueId." });
    }

    console.log("Received match creation request with data:", req.body);

    const newMatch = await matchService.createMatch(
      homeTeamId,
      awayTeamId,
      matchTime,
      refereeId,
      statisticianId,
      leagueId
    );

    res.status(201).json(newMatch);
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Error creating match. Details: " + error.message });
  }
};


const getDataCreateMatch = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const newMatch = await matchService.getDataCreateMatch(leagueId);
    res.json(newMatch);
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Error creating matches" });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params; // Make sure `matchId` is coming from `req.params`
    
    if (!matchId) {
      return res.status(400).json({ error: "Match ID is required" });
    }

    const deletedMatch = await matchService.deleteMatch(matchId);
    res.json(deletedMatch);
  } catch (error) {
    console.error("Controller Error:", error.message);  // Log error for better visibility
    res.status(500).json({ error: "Error deleting matches" });
  }
};

module.exports = {
  updateMatch,
  getStats,
  uploadHighlights,
  getMatchDetails,
  getMatchesByLeagueId,
  getMatchById,
  updateForfeited,
  createMatch,
  getDataCreateMatch,
  deleteMatch,
  getMatchesByUser
};
