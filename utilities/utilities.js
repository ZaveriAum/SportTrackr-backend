const toCamelCase = (obj) => {
    const result = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  };
  const transformTeamData = (data) => {
    const matchResult = {
      matchId: data[0]?.match_id || null,
      homeTeam: {
        id: null,
        name: null,
        logo: null,
        players: [],
      },
      awayTeam: {
        id: null,
        name: null,
        logo: null,
        players: [],
      },
    };
  
    data.forEach((player) => {
      const teamKey = matchResult.homeTeam.id === null
        ? 'homeTeam'
        : player.team_id === matchResult.homeTeam.id
        ? 'homeTeam'
        : 'awayTeam';
  
      if (!matchResult[teamKey].id) {
        matchResult[teamKey].id = player.team_id;
        matchResult[teamKey].name = player.user_team_name;
        matchResult[teamKey].logo = player.team_logo;  // Include team logo
      }
  
      matchResult[teamKey].players.push({
        user_id: player.user_id,
        user_name: player.user_name,
        user_email: player.user_email,
        position_played: player.position_played,
        number: player.number,
        stats: {
          goals: player.goals || 0,
          shots: player.shots || 0,
          assists: player.assists || 0,
          saves: player.saves || 0,
          interceptions: player.interceptions || 0,
          yellow_card: player.yellow_card || 0,
          red_card: player.red_card || 0,
        },
      });
    });
  
    return matchResult;
  };
  

  module.exports = {
    toCamelCase,
    transformTeamData
}
