const mongoose = require('mongoose');
const ServiceCategory = require('./src/models/urban-services/serviceCategory');
require('dotenv').config();

const urbanServicesCategories = [
  // Home Appliances
  {
    name: 'AC Service & Repair',
    slug: 'ac-service-repair',
    description: 'Professional AC installation, repair, and maintenance services',
    icon: 'ac',
    image: '/images/services/ac-service.jpg',
    pricingType: 'fixed',
    minPrice: 299,
    maxPrice: 1999,
    estimatedDuration: 90,
    serviceAreas: ['All Cities'],
    metaTitle: 'AC Service & Repair - Urban Services',
    metaDescription: 'Best AC repair and maintenance services at affordable prices'
  },
  {
    name: 'Washing Machine Service',
    slug: 'washing-machine-service',
    description: 'Expert washing machine repair and maintenance',
    icon: 'washing-machine',
    image: '/images/services/washing-machine.jpg',
    pricingType: 'fixed',
    minPrice: 249,
    maxPrice: 1499,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Water Heater Service',
    slug: 'water-heater-service',
    description: 'Water heater installation, repair, and maintenance',
    icon: 'water-heater',
    image: '/images/services/water-heater.jpg',
    pricingType: 'fixed',
    minPrice: 399,
    maxPrice: 1799,
    estimatedDuration: 75,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Refrigerator Service',
    slug: 'refrigerator-service',
    description: 'Refrigerator repair and maintenance services',
    icon: 'refrigerator',
    image: '/images/services/refrigerator.jpg',
    pricingType: 'fixed',
    minPrice: 349,
    maxPrice: 1899,
    estimatedDuration: 90,
    serviceAreas: ['All Cities']
  },
  {
    name: 'TV Service',
    slug: 'tv-service',
    description: 'TV repair and installation services',
    icon: 'tv',
    image: '/images/services/tv-service.jpg',
    pricingType: 'fixed',
    minPrice: 299,
    maxPrice: 1599,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Home Theatre & Sound System',
    slug: 'home-theatre-sound-system',
    description: 'Home theatre and sound system installation & repair',
    icon: 'home-theatre',
    image: '/images/services/home-theatre.jpg',
    pricingType: 'fixed',
    minPrice: 499,
    maxPrice: 2499,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Mixie & Grinder Repair',
    slug: 'mixie-grinder-repair',
    description: 'Mixer grinder repair and maintenance',
    icon: 'mixie',
    image: '/images/services/mixie-grinder.jpg',
    pricingType: 'fixed',
    minPrice: 199,
    maxPrice: 799,
    estimatedDuration: 45,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Microwave Oven Repair',
    slug: 'microwave-oven-repair',
    description: 'Microwave oven repair services',
    icon: 'microwave',
    image: '/images/services/microwave.jpg',
    pricingType: 'fixed',
    minPrice: 249,
    maxPrice: 999,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },

  // Electrical Services
  {
    name: 'Electrician Services',
    slug: 'electrician-services',
    description: 'Complete electrical solutions for home and office',
    icon: 'electrician',
    image: '/images/services/electrician.jpg',
    pricingType: 'hourly',
    minPrice: 199,
    maxPrice: 599,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Light & Fan Repair',
    slug: 'light-fan-repair',
    description: 'Light and fan repair services',
    icon: 'light-fan',
    image: '/images/services/light-fan.jpg',
    pricingType: 'fixed',
    minPrice: 149,
    maxPrice: 499,
    estimatedDuration: 45,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Switchboard & House Wiring',
    slug: 'switchboard-house-wiring',
    description: 'Switchboard repair and house wiring services',
    icon: 'switchboard',
    image: '/images/services/switchboard.jpg',
    pricingType: 'quote',
    minPrice: 299,
    maxPrice: 2999,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },

  // Technology Services
  {
    name: 'Computer / Laptop Service',
    slug: 'computer-laptop-service',
    description: 'Computer and laptop repair services',
    icon: 'laptop',
    image: '/images/services/computer-laptop.jpg',
    pricingType: 'quote',
    minPrice: 199,
    maxPrice: 1999,
    estimatedDuration: 90,
    serviceAreas: ['All Cities']
  },

  // Plumbing Services
  {
    name: 'Plumbing Service',
    slug: 'plumbing-service',
    description: 'Complete plumbing solutions for home and office',
    icon: 'plumbing',
    image: '/images/services/plumbing.jpg',
    pricingType: 'hourly',
    minPrice: 249,
    maxPrice: 699,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },

  // Vehicle Services
  {
    name: 'Car Mechanic',
    slug: 'car-mechanic',
    description: 'Professional car repair and maintenance services',
    icon: 'car',
    image: '/images/services/car-mechanic.jpg',
    pricingType: 'quote',
    minPrice: 299,
    maxPrice: 4999,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Bike Mechanic',
    slug: 'bike-mechanic',
    description: 'Bike repair and maintenance services',
    icon: 'bike',
    image: '/images/services/bike-mechanic.jpg',
    pricingType: 'fixed',
    minPrice: 199,
    maxPrice: 1999,
    estimatedDuration: 90,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Three-wheeler Mechanic',
    slug: 'three-wheeler-mechanic',
    description: 'Three-wheeler repair services',
    icon: 'three-wheeler',
    image: '/images/services/three-wheeler.jpg',
    pricingType: 'fixed',
    minPrice: 249,
    maxPrice: 2499,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Four-wheeler Mechanic',
    slug: 'four-wheeler-mechanic',
    description: 'Four-wheeler repair and maintenance',
    icon: 'four-wheeler',
    image: '/images/services/four-wheeler.jpg',
    pricingType: 'quote',
    minPrice: 349,
    maxPrice: 5999,
    estimatedDuration: 150,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Lorry Mechanic',
    slug: 'lorry-mechanic',
    description: 'Lorry and truck repair services',
    icon: 'lorry',
    image: '/images/services/lorry.jpg',
    pricingType: 'quote',
    minPrice: 499,
    maxPrice: 7999,
    estimatedDuration: 180,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Vehicle Puncture Repair',
    slug: 'vehicle-puncture-repair',
    description: 'Quick puncture repair services',
    icon: 'puncture',
    image: '/images/services/puncture.jpg',
    pricingType: 'fixed',
    minPrice: 99,
    maxPrice: 299,
    estimatedDuration: 30,
    serviceAreas: ['All Cities']
  },

  // Home Services
  {
    name: 'Home & Office Pest Control',
    slug: 'pest-control',
    description: 'Professional pest control services',
    icon: 'pest-control',
    image: '/images/services/pest-control.jpg',
    pricingType: 'quote',
    minPrice: 599,
    maxPrice: 3999,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Water Purifier Service',
    slug: 'water-purifier-service',
    description: 'Water purifier installation and maintenance',
    icon: 'water-purifier',
    image: '/images/services/water-purifier.jpg',
    pricingType: 'fixed',
    minPrice: 299,
    maxPrice: 1299,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Garden Cleaning',
    slug: 'garden-cleaning',
    description: 'Professional garden cleaning services',
    icon: 'garden-cleaning',
    image: '/images/services/garden-cleaning.jpg',
    pricingType: 'hourly',
    minPrice: 199,
    maxPrice: 499,
    estimatedDuration: 90,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Garden Maintenance',
    slug: 'garden-maintenance',
    description: 'Complete garden maintenance solutions',
    icon: 'garden-maintenance',
    image: '/images/services/garden-maintenance.jpg',
    pricingType: 'hourly',
    minPrice: 249,
    maxPrice: 599,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },

  // Personal Services
  {
    name: 'Priest Service',
    slug: 'priest-service',
    description: 'Religious and ceremonial services',
    icon: 'priest',
    image: '/images/services/priest.jpg',
    pricingType: 'fixed',
    minPrice: 999,
    maxPrice: 4999,
    estimatedDuration: 120,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Family Doctor On-Call',
    slug: 'family-doctor-oncall',
    description: 'Family doctor consultation at home',
    icon: 'doctor',
    image: '/images/services/doctor.jpg',
    pricingType: 'fixed',
    minPrice: 599,
    maxPrice: 1999,
    estimatedDuration: 45,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Home Care Nursing',
    slug: 'home-care-nursing',
    description: 'Professional nursing care at home',
    icon: 'nursing',
    image: '/images/services/nursing.jpg',
    pricingType: 'hourly',
    minPrice: 399,
    maxPrice: 899,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },
  {
    name: 'Car Washing',
    slug: 'car-washing',
    description: 'Professional car washing and detailing',
    icon: 'car-wash',
    image: '/images/services/car-wash.jpg',
    pricingType: 'fixed',
    minPrice: 199,
    maxPrice: 999,
    estimatedDuration: 60,
    serviceAreas: ['All Cities']
  },
  {
    name: 'CCTV Camera Installation & Repair',
    slug: 'cctv-camera-installation-repair',
    description: 'CCTV installation and repair services',
    icon: 'cctv',
    image: '/images/services/cctv.jpg',
    pricingType: 'quote',
    minPrice: 499,
    maxPrice: 4999,
    estimatedDuration: 150,
    serviceAreas: ['All Cities']
  }
];

async function seedUrbanServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await ServiceCategory.deleteMany({});
    console.log('Cleared existing Urban Services categories');

    // Insert new categories
    const insertedCategories = await ServiceCategory.insertMany(urbanServicesCategories);
    console.log(`Inserted ${insertedCategories.length} Urban Services categories`);

    console.log('Urban Services seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Urban Services:', error);
    process.exit(1);
  }
}

seedUrbanServices();
