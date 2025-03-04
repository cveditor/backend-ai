// Calcola la performance del post (engagement)
const calculateEngagementRate = (likes = 0, comments = 0, shares = 0, followers = 1) => {
    if (followers <= 0) {
      return 0; // Per evitare divisioni per zero
    }
    return ((likes + comments + shares) / followers) * 100;
  };
  
  module.exports = { calculateEngagementRate };
  