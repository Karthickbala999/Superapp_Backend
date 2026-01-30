const Service = require('../../models/urban-services/service');
const ServiceCategory = require('../../models/urban-services/serviceCategory');
const asyncHandler = require('express-async-handler');

// @desc    Get all services
// @route   GET /api/urban-services/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { category, active, city } = req.query;
  
  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  if (city) {
    query['serviceAreas.city'] = city;
  }
  
  const services = await Service.find(query)
    .populate('category', 'name slug image')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/urban-services/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('category', 'name slug image description')
    .populate('reviews');
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }
  
  res.json({
    success: true,
    data: service
  });
});

// @desc    Create service
// @route   POST /api/urban-services/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const service = new Service(req.body);
  
  // Generate slug from name if not provided
  if (!service.slug) {
    service.slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  const savedService = await service.save();
  
  res.status(201).json({
    success: true,
    data: savedService
  });
});

// @desc    Update service
// @route   PUT /api/urban-services/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }
  
  Object.assign(service, req.body);
  
  if (req.body.name && !req.body.slug) {
    service.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  const updatedService = await service.save();
  
  res.json({
    success: true,
    data: updatedService
  });
});

// @desc    Delete service
// @route   DELETE /api/urban-services/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }
  
  await Service.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Service deleted successfully'
  });
});

// @desc    Get services by category
// @route   GET /api/urban-services/services/category/:categoryId
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { active } = req.query;
  
  let query = { category: categoryId };
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  const services = await Service.find(query)
    .populate('category', 'name slug image')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Search services
// @route   GET /api/urban-services/services/search
// @access  Public
const searchServices = asyncHandler(async (req, res) => {
  const { q, category, city } = req.query;
  
  let query = {};
  
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { shortDescription: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  if (city) {
    query['serviceAreas.city'] = city;
  }
  
  query.isActive = true;
  
  const services = await Service.find(query)
    .populate('category', 'name slug image')
    .sort({ popular: -1, sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Seed urban services data
// @route   POST /api/urban-services/services/seed
// @access  Private/Admin
const seedUrbanServices = asyncHandler(async (req, res) => {
  const urbanServicesCategories = [
    {
      name: 'AC Service & Repair',
      slug: 'ac-service-repair',
      description: 'Professional AC installation, repair, and maintenance services',
      icon: 'ac',
      image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=AC+Service',
      pricingType: 'fixed',
      minPrice: 299,
      maxPrice: 1999,
      estimatedDuration: 90,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Washing Machine Service',
      slug: 'washing-machine-service',
      description: 'Expert washing machine repair and maintenance',
      icon: 'washing-machine',
      image: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Washing+Machine',
      pricingType: 'fixed',
      minPrice: 249,
      maxPrice: 1499,
      estimatedDuration: 60,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Refrigerator Service',
      slug: 'refrigerator-service',
      description: 'Professional refrigerator repair and maintenance',
      icon: 'refrigerator',
      image: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Refrigerator',
      pricingType: 'fixed',
      minPrice: 349,
      maxPrice: 1799,
      estimatedDuration: 75,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Plumbing Services',
      slug: 'plumbing-services',
      description: 'Expert plumbing repair and installation services',
      icon: 'plumbing',
      image: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Plumbing',
      pricingType: 'quote',
      minPrice: 199,
      maxPrice: 2999,
      estimatedDuration: 120,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Electrical Services',
      slug: 'electrical-services',
      description: 'Professional electrical repair and installation',
      icon: 'electrical',
      image: 'https://via.placeholder.com/300x200/F44336/FFFFFF?text=Electrical',
      pricingType: 'quote',
      minPrice: 299,
      maxPrice: 3999,
      estimatedDuration: 90,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 5
    }
  ];

  try {
    // Clear existing categories
    await ServiceCategory.deleteMany({});
    console.log('Cleared existing Urban Services categories');

    // Insert new categories
    const insertedCategories = await ServiceCategory.insertMany(urbanServicesCategories);
    console.log(`Inserted ${insertedCategories.length} Urban Services categories`);

    res.json({
      success: true,
      message: `Successfully seeded ${insertedCategories.length} urban services categories`,
      count: insertedCategories.length,
      data: insertedCategories
    });
  } catch (error) {
    console.error('Error seeding Urban Services:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding urban services',
      error: error.message
    });
  }
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  searchServices,
  seedUrbanServices
};
