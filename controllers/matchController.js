const matchService = require("../services/matchService");

const updateMatch = async (req, res, next) => {
  try {
    await matchService.updateMatch(req.user, req.body);
    res.status(200).json({
      message: "Match Updated Successfully",
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

module.exports = {
  updateMatch,
  getStats,
  uploadHighlights,
  getMatchDetails
};
