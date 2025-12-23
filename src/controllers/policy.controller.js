const Policy = require('../models/policy');

// Get all policies
const getAllPolicies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, hotel_id } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (status !== undefined && status !== 'all') {
      query.status = status === 'true';
    }

    if (hotel_id) {
      query.hotel_id = hotel_id;
    }

    const [policies, total] = await Promise.all([
      Policy.find(query)
        .populate('hotel', 'name')
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit)),
      Policy.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: policies,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get policy by ID
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findById(id).populate('hotel', 'name');
    
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create new policy
const createPolicy = async (req, res) => {
  try {
    const { title, description, hotel_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const policy = new Policy({
      title,
      description: description || null,
      hotel_id: hotel_id || null,
      status: true
    });

    await policy.save();

    const populatedPolicy = await Policy.findById(policy._id).populate('hotel', 'name');

    res.status(201).json({ success: true, data: populatedPolicy });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update policy
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, hotel_id } = req.body;
    
    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    policy.title = title || policy.title;
    policy.description = description !== undefined ? description : policy.description;
    if (hotel_id !== undefined) {
      policy.hotel_id = hotel_id;
    }

    await policy.save();

    const updatedPolicy = await Policy.findById(id).populate('hotel', 'name');

    res.json({ success: true, data: updatedPolicy });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Toggle policy status
const togglePolicyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    policy.status = !policy.status;
    await policy.save();
    
    const updatedPolicy = await Policy.findById(id).populate('hotel', 'name');
    
    res.json({ success: true, data: updatedPolicy });
  } catch (error) {
    console.error('Error toggling policy status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete policy
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    await Policy.findByIdAndDelete(id);
    
    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  togglePolicyStatus,
  deletePolicy
}; 