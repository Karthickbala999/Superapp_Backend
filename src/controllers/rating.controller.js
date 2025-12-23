// Rating Controller
const Rating = require('../models/rating');
const Porter = require('../models/porter');

module.exports = {
  // Add a rating for a completed order
  addRating: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { customer, porter, stars, comment } = req.body;
      if (!stars || stars < 1 || stars > 5) {
        return res.status(400).json({ message: 'Stars must be between 1 and 5' });
      }
      // Create rating
      const rating = await Rating.create({
        order: orderId,
        customer,
        porter,
        stars,
        comment
      });
      // Update porter's average rating
      const ratings = await Rating.find({ porter });
      const avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
      await Porter.findByIdAndUpdate(porter, { rating: avgRating });
      res.status(201).json({ message: 'Rating added', rating });
    } catch (error) {
      res.status(500).json({ message: 'Error adding rating', error: error.message });
    }
  },
  // Get ratings for a porter
  getPorterRatings: async (req, res) => {
    try {
      const { porterId } = req.params;
      const ratings = await Rating.find({ porter: porterId }).sort({ createdAt: -1 });
      res.status(200).json({ ratings });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ratings', error: error.message });
    }
  }
}; 