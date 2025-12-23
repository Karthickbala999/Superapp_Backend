const FAQ = require('../models/faq');

// Get all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

// Get FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message
    });
  }
};

// Create new FAQ
exports.createFaq = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const faq = await FAQ.create({
      title,
      description,
      status: true
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    if (title !== undefined) faq.title = title;
    if (description !== undefined) faq.description = description;
    if (status !== undefined) faq.status = status === 'true' || status === true;

    await faq.save();

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// Toggle FAQ status
exports.toggleFaqStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    faq.status = !faq.status;
    await faq.save();

    res.json({
      success: true,
      message: `FAQ ${faq.status ? 'activated' : 'deactivated'} successfully`,
      data: faq
    });
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling FAQ status',
      error: error.message
    });
  }
};

// Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await faq.destroy();

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
}; 