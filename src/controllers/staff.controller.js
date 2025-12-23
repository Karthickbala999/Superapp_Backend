const Staff = require('../models/staff');
const User = require('../models/user');

// Get all staff with user details
exports.getAllStaff = async (req, res) => {
  try {
    // Only show active staff by default, allow ?status=all to fetch all
    const statusFilter = req.query.status === 'all' ? {} : { status: true };
    
    const staff = await Staff.find(statusFilter)
      .populate('user', 'id name email phone role status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'id name email phone role status');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// Create new staff
exports.createStaff = async (req, res) => {
  try {
    const { user_id, department, position, hire_date, salary, status } = req.body;

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if staff already exists for this user
    const staffExists = await Staff.findOne({ user_id });
    if (staffExists) {
      return res.status(400).json({
        success: false,
        message: 'Staff record already exists for this user'
      });
    }

    // Create staff
    const staff = new Staff({
      user_id,
      department,
      position,
      hire_date: hire_date || null,
      salary: salary || null,
      status: status === 'true' || status === true
    });

    await staff.save();

    // Fetch staff with user details
    const staffWithUser = await Staff.findById(staff._id)
      .populate('user', 'id name email phone role status');

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staffWithUser
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating staff',
      error: error.message
    });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { department, position, hire_date, salary, status } = req.body;
    const staffId = req.params.id;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Update staff
    staff.department = department || staff.department;
    staff.position = position || staff.position;
    staff.hire_date = hire_date || staff.hire_date;
    staff.salary = salary || staff.salary;
    staff.status = status === 'true' || status === true;

    await staff.save();

    // Fetch updated staff with user details
    const updatedStaff = await Staff.findById(staffId)
      .populate('user', 'id name email phone role status');

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: updatedStaff
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating staff',
      error: error.message
    });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.id;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    await Staff.findByIdAndDelete(staffId);

    res.json({
      success: true,
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff',
      error: error.message
    });
  }
}; 