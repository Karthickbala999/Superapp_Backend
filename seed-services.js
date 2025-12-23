const mongoose = require('mongoose');
const Service = require('./src/models/urban-services/service');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');
require('dotenv').config();

const sampleServices = [
  // AC Services
  {
    name: 'AC Installation Service',
    slug: 'ac-installation-service',
    description: 'Professional AC installation with warranty support. Includes mounting, wiring, and gas filling.',
    shortDescription: 'Expert AC installation at your doorstep',
    category: null, // Will be populated dynamically
    pricing: {
      type: 'fixed',
      basePrice: 999,
      additionalCharges: 0,
      maxPrice: 1499,
      currency: 'INR'
    },
    duration: 120,
    durationUnit: 'minutes',
    features: ['Free installation', 'Warranty support', 'Expert technicians', 'Same day service'],
    includes: ['AC unit mounting', 'Electrical wiring', 'Gas filling', 'Testing'],
    excludes: ['AC unit cost', 'Additional wiring if needed', 'Outdoor unit stand'],
    requirements: ['Access to balcony/terrace', 'Electrical socket nearby', 'Payment method'],
    images: ['/images/services/ac-installation-1.jpg'],
    isActive: true,
    popular: true,
    serviceAreas: [{ city: 'All Cities', areas: [], pinCodes: [], available: true }],
    tags: ['ac', 'installation', 'cooling', 'summer'],
    specifications: [
      { key: 'Service Type', value: 'Installation' },
      { key: 'Warranty', value: '1 Year' },
      { key: 'Service Time', value: '2-3 hours' }
    ]
  },
  {
    name: 'AC Repair Service',
    slug: 'ac-repair-service',
    description: 'Complete AC repair service for all brands. Includes diagnosis, repair, and testing.',
    shortDescription: 'Quick AC repair for all cooling issues',
    category: null,
    pricing: {
      type: 'quote',
      basePrice: 299,
      additionalCharges: 0,
      maxPrice: 1999,
      currency: 'INR'
    },
    duration: 90,
    durationUnit: 'minutes',
    features: ['Same day service', 'All brands supported', 'Genuine parts', 'Warranty on repair'],
    includes: ['Diagnosis', 'Labor charges', 'Minor parts', 'Testing'],
    excludes: ['Major replacement parts', 'Gas filling (extra charge)', 'New components'],
    requirements: ['Access to AC unit', 'Power supply', 'Model information'],
    images: ['/images/services/ac-repair-1.jpg'],
    isActive: true,
    popular: true,
    serviceAreas: [{ city: 'All Cities', areas: [], pinCodes: [], available: true }],
    tags: ['ac', 'repair', 'cooling', 'emergency'],
    specifications: [
      { key: 'Service Type', value: 'Repair' },
      { key: 'Brands Supported', value: 'All Brands' },
      { key: 'Response Time', value: '2-4 hours' }
    ]
  },

  // Plumbing Services
  {
    name: 'Pipe Leakage Repair',
    slug: 'pipe-leakage-repair',
    description: 'Professional pipe leakage detection and repair service for all types of pipes.',
    shortDescription: 'Fix pipe leaks quickly and efficiently',
    category: null,
    pricing: {
      type: 'hourly',
      basePrice: 249,
      additionalCharges: 0,
      maxPrice: 699,
      currency: 'INR'
    },
    duration: 60,
    durationUnit: 'minutes',
    features: ['24/7 service', 'Experienced plumbers', 'Quality materials', 'Leak detection'],
    includes: ['Inspection', 'Minor repair work', 'Basic materials', 'Testing'],
    excludes: ['Major pipe replacement', 'New fittings', 'Water tank repair'],
    requirements: ['Access to affected area', 'Water supply can be stopped', 'Payment method'],
    images: ['/images/services/plumbing-1.jpg'],
    isActive: true,
    popular: false,
    serviceAreas: [{ city: 'All Cities', areas: [], pinCodes: [], available: true }],
    tags: ['plumbing', 'leak', 'pipe', 'repair'],
    specifications: [
      { key: 'Service Type', value: 'Repair' },
      { key: 'Availability', value: '24/7' },
      { key: 'Materials', value: 'Standard Quality' }
    ]
  },

  // Electrical Services
  {
    name: 'Complete House Wiring',
    slug: 'complete-house-wiring',
    description: 'Complete electrical wiring solutions for new and existing homes.',
    shortDescription: 'Safe and reliable house wiring services',
    category: null,
    pricing: {
      type: 'quote',
      basePrice: 299,
      additionalCharges: 0,
      maxPrice: 2999,
      currency: 'INR'
    },
    duration: 120,
    durationUnit: 'minutes',
    features: ['Certified electricians', 'Quality materials', 'Safety compliance', 'Warranty'],
    includes: ['Wiring installation', 'Switch boards', 'Basic testing', 'Safety check'],
    excludes: ['Electrical appliances', 'Light fixtures', 'AC wiring'],
    requirements: ['House access', 'Power can be disconnected', 'Layout plan'],
    images: ['/images/services/electrical-1.jpg'],
    isActive: true,
    popular: false,
    serviceAreas: [{ city: 'All Cities', areas: [], pinCodes: [], available: true }],
    tags: ['electrical', 'wiring', 'safety', 'installation'],
    specifications: [
      { key: 'Service Type', value: 'Installation' },
      { key: 'Certification', value: 'CE Certified' },
      { key: 'Warranty', value: '2 Years' }
    ]
  },

  // Vehicle Services
  {
    name: 'Regular Car Service',
    slug: 'regular-car-service',
    description: 'Complete car service including oil change, filter replacement, and general checkup.',
    shortDescription: 'Comprehensive car maintenance service',
    category: null,
    pricing: {
      type: 'fixed',
      basePrice: 1499,
      additionalCharges: 0,
      maxPrice: 2999,
      currency: 'INR'
    },
    duration: 180,
    durationUnit: 'minutes',
    features: ['Experienced mechanics', 'Genuine parts', 'Computer diagnostics', 'Service report'],
    includes: ['Oil change', 'Filter replacement', 'General checkup', 'Car wash'],
    excludes: ['Major repairs', 'Replacement parts cost', 'Tires'],
    requirements: ['Car at service center', 'Service history', 'Keys'],
    images: ['/images/services/car-service-1.jpg'],
    isActive: true,
    popular: true,
    serviceAreas: [{ city: 'All Cities', areas: [], pinCodes: [], available: true }],
    tags: ['car', 'service', 'maintenance', 'oil'],
    specifications: [
      { key: 'Service Type', value: 'Maintenance' },
      { key: 'Duration', value: '3-4 hours' },
      { key: 'Warranty', value: '6 months' }
    ]
  },

  // Home Services
  {
    name: 'Deep House Cleaning',
    slug: 'deep-house-cleaning',
    description: 'Professional deep cleaning service for entire house including kitchen, bathroom, and living areas.',
    shortDescription: 'Thorough home cleaning service',
    category: null,
    pricing: {
      type: 'fixed',
      basePrice: 999,
      additionalCharges: 0,
      maxPrice: 2499,
      currency: 'INR'
    },
    duration: 240,
    durationUnit: 'minutes',
    features: ['Trained professionals', 'Eco-friendly products', 'All rooms covered', 'Satisfaction guaranteed'],
    includes: ['All rooms cleaning', 'Kitchen cleaning', 'Bathroom cleaning', 'Dusting'],
    excludes: ['Laundry', 'Dish washing', 'Window cleaning (extra)'],
    requirements: ['House access', 'Water supply', 'Electricity'],
    images: ['/images/services/cleaning-1.jpg'],
    isActive: true,
    popular: false,
    serviceAreas: [{ city: 'All Cities', areas: [], pinCodes: [], available: true }],
    tags: ['cleaning', 'home', 'deep', 'professional'],
    specifications: [
      { key: 'Service Type', value: 'Cleaning' },
      { key: 'Team Size', value: '2-3 persons' },
      { key: 'Duration', value: '4-5 hours' }
    ]
  }
];

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get categories
    const categories = await ServiceCategory.find({});
    console.log(`Found ${categories.length} categories`);

    // Create category mapping
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Map services to categories
    const servicesWithCategories = sampleServices.map(service => {
      let categoryId;
      
      // Map services to appropriate categories
      if (service.slug.includes('ac')) {
        categoryId = categoryMap['ac-service-repair'];
      } else if (service.slug.includes('plumbing')) {
        categoryId = categoryMap['plumbing-service'];
      } else if (service.slug.includes('electrical') || service.slug.includes('wiring')) {
        categoryId = categoryMap['switchboard-house-wiring'];
      } else if (service.slug.includes('car')) {
        categoryId = categoryMap['car-mechanic'];
      } else if (service.slug.includes('cleaning')) {
        categoryId = categoryMap['garden-cleaning']; // Using garden cleaning as general cleaning
      } else {
        // Default to first category
        categoryId = categories[0]._id;
      }

      return {
        ...service,
        category: categoryId
      };
    });

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    const insertedServices = await Service.insertMany(servicesWithCategories);
    console.log(`Inserted ${insertedServices.length} services`);

    console.log('Services seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();
