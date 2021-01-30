var serverStatistics = {
    since: Date.now(),  // Date since stat tracking started
    gamesStarted: 0,    // Games started
    gamesAborted: 0,    // Games aborted
    playersOnline: 0
  };
  
module.exports = serverStatistics; // For explanation on module.exports https://www.sitepoint.com/understanding-module-exports-exports-node-js/
