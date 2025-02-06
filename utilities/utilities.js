const toCamelCase = (obj) => {
    const result = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  };

  const transformTeamData = (data) => {
    const result = {};
  
    data.forEach((player) => {
      const matchId = player.match_id;
      if (!result[matchId]) {
        result[matchId] = {
          matchId: matchId,
          homeTeam: {
            id: null,
            players: []
          },
          awayTeam: {
            id: null, 
            players: []
          }
        };
      }
  
      const team = player.team_id === 1 ? 'homeTeam' : 'awayTeam';
      result[matchId][team].id = player.team_id; 
      result[matchId][team].players.push({
        user_id: player.user_id,
        user_name: player.user_name,
        user_email: player.user_email,
        position_played: player.position_played,
        number: player.number
      });
    });
  
    return Object.values(result);
  };


  module.exports = {
    toCamelCase,
    transformTeamData
}
