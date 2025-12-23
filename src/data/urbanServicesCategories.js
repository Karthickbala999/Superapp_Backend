const urbanServicesCategories = [
  {
    name: "Home Cleaning",
    icon: "🧹",
    description: "Professional cleaning services for your home",
    services: [
      { name: "Deep Cleaning", basePrice: 299, duration: 120 },
      { name: "Regular Cleaning", basePrice: 199, duration: 90 },
      { name: "Kitchen Cleaning", basePrice: 249, duration: 60 },
      { name: "Bathroom Cleaning", basePrice: 199, duration: 45 },
      { name: "Sofa Cleaning", basePrice: 399, duration: 90 }
    ]
  },
  {
    name: "Plumbing",
    icon: "🔧",
    description: "Expert plumbing solutions",
    services: [
      { name: "Pipe Repair", basePrice: 199, duration: 60 },
      { name: "Tap Installation", basePrice: 149, duration: 30 },
      { name: "Drain Cleaning", basePrice: 249, duration: 45 },
      { name: "Water Tank Cleaning", basePrice: 599, duration: 120 },
      { name: "Geyser Repair", basePrice: 349, duration: 60 }
    ]
  },
  {
    name: "Electrical",
    icon: "⚡",
    description: "Safe and reliable electrical services",
    services: [
      { name: "AC Repair", basePrice: 249, duration: 60 },
      { name: "Fan Installation", basePrice: 149, duration: 30 },
      { name: "Lighting Installation", basePrice: 199, duration: 45 },
      { name: "Wiring & Rewiring", basePrice: 499, duration: 120 },
      { name: "Inverter Installation", basePrice: 799, duration: 180 }
    ]
  },
  {
    name: "Carpentry",
    icon: "🔨",
    description: "Custom woodworking and furniture solutions",
    services: [
      { name: "Furniture Assembly", basePrice: 399, duration: 120 },
      { name: "Door Repair", basePrice: 299, duration: 60 },
      { name: "Cabinet Making", basePrice: 899, duration: 240 },
      { name: "Wood Polishing", basePrice: 499, duration: 180 },
      { name: "Shelf Installation", basePrice: 349, duration: 90 }
    ]
  },
  {
    name: "Painting",
    icon: "🎨",
    description: "Professional painting and waterproofing",
    services: [
      { name: "Wall Painting", basePrice: 599, duration: 240 },
      { name: "Wood Polishing", basePrice: 499, duration: 180 },
      { name: "Waterproofing", basePrice: 799, duration: 300 },
      { name: "Texture Painting", basePrice: 899, duration: 360 },
      { name: "Enamel Painting", basePrice: 699, duration: 240 }
    ]
  },
  {
    name: "Appliance Repair",
    icon: "🔌",
    description: "Repair and maintenance for home appliances",
    services: [
      { name: "Washing Machine Repair", basePrice: 299, duration: 60 },
      { name: "Refrigerator Repair", basePrice: 349, duration: 90 },
      { name: "Microwave Repair", basePrice: 249, duration: 45 },
      { name: "TV Repair", basePrice: 399, duration: 60 },
      { name: "Oven Repair", basePrice: 349, duration: 60 }
    ]
  },
  {
    name: "Pest Control",
    icon: "🐜",
    description: "Effective pest control solutions",
    services: [
      { name: "Cockroach Control", basePrice: 399, duration: 60 },
      { name: "Termite Control", basePrice: 899, duration: 180 },
      { name: "Mosquito Control", basePrice: 299, duration: 45 },
      { name: "Rodent Control", basePrice: 499, duration: 90 },
      { name: "Bed Bug Treatment", basePrice: 699, duration: 120 }
    ]
  },
  {
    name: "Beauty & Wellness",
    icon: "💅",
    description: "Personal care and beauty services at home",
    services: [
      { name: "Haircut", basePrice: 199, duration: 45 },
      { name: "Facial", basePrice: 299, duration: 60 },
      { name: "Massage", basePrice: 499, duration: 90 },
      { name: "Manicure & Pedicure", basePrice: 399, duration: 90 },
      { name: "Waxing", basePrice: 299, duration: 60 }
    ]
  },
  {
    name: "Fitness & Training",
    icon: "💪",
    description: "Personal fitness and training services",
    services: [
      { name: "Personal Training", basePrice: 599, duration: 60 },
      { name: "Yoga Session", basePrice: 399, duration: 60 },
      { name: "Dance Class", basePrice: 499, duration: 60 },
      { name: "Meditation", basePrice: 299, duration: 45 },
      { name: "Nutrition Consultation", basePrice: 499, duration: 60 }
    ]
  },
  {
    name: "Home Salon",
    icon: "💇",
    description: "Complete salon services at your doorstep",
    services: [
      { name: "Hair Styling", basePrice: 299, duration: 60 },
      { name: "Hair Coloring", basePrice: 599, duration: 120 },
      { name: "Hair Spa", basePrice: 399, duration: 60 },
      { name: "Bridal Makeup", basePrice: 1999, duration: 180 },
      { name: "Party Makeup", basePrice: 999, duration: 90 }
    ]
  },
  {
    name: "Laundry & Dry Cleaning",
    icon: "👔",
    description: "Professional laundry and dry cleaning services",
    services: [
      { name: "Wash & Iron", basePrice: 99, duration: 120 },
      { name: "Dry Cleaning", basePrice: 149, duration: 180 },
      { name: "Steam Iron", basePrice: 49, duration: 60 },
      { name: "Shoe Cleaning", basePrice: 99, duration: 45 },
      { name: "Carpet Cleaning", basePrice: 299, duration: 120 }
    ]
  },
  {
    name: "Water Purification",
    icon: "💧",
    description: "Water purifier installation and maintenance",
    services: [
      { name: "RO Installation", basePrice: 599, duration: 120 },
      { name: "RO Repair", basePrice: 299, duration: 60 },
      { name: "Filter Change", basePrice: 199, duration: 30 },
      { name: "Water Tank Cleaning", basePrice: 599, duration: 120 },
      { name: "UV Purifier Service", basePrice: 349, duration: 45 }
    ]
  },
  {
    name: "Kitchen & Appliance",
    icon: "🍳",
    description: "Kitchen setup and appliance services",
    services: [
      { name: "Chimney Installation", basePrice: 499, duration: 90 },
      { name: "Chimney Cleaning", basePrice: 299, duration: 60 },
      { name: "Hob Installation", basePrice: 399, duration: 60 },
      { name: "Dishwasher Installation", basePrice: 499, duration: 90 },
      { name: "Kitchen Deep Cleaning", basePrice: 799, duration: 180 }
    ]
  },
  {
    name: "AC & Cooling",
    icon: "❄️",
    description: "Air conditioning and cooling solutions",
    services: [
      { name: "AC Installation", basePrice: 599, duration: 120 },
      { name: "AC Repair", basePrice: 249, duration: 60 },
      { name: "AC Servicing", basePrice: 299, duration: 60 },
      { name: "Gas Refill", basePrice: 199, duration: 30 },
      { name: "Cooler Service", basePrice: 199, duration: 45 }
    ]
  },
  {
    name: "Home Security",
    icon: "🔒",
    description: "Security system installation and maintenance",
    services: [
      { name: "CCTV Installation", basePrice: 999, duration: 180 },
      { name: "Alarm System", basePrice: 799, duration: 120 },
      { name: "Door Lock Repair", basePrice: 299, duration: 45 },
      { name: "Safe Installation", basePrice: 599, duration: 90 },
      { name: "Security Audit", basePrice: 499, duration: 60 }
    ]
  },
  {
    name: "Gardening & Landscaping",
    icon: "🌿",
    description: "Garden maintenance and landscaping services",
    services: [
      { name: "Garden Maintenance", basePrice: 399, duration: 120 },
      { name: "Lawn Mowing", basePrice: 199, duration: 60 },
      { name: "Plantation", basePrice: 299, duration: 90 },
      { name: "Landscape Design", basePrice: 999, duration: 180 },
      { name: "Pest Control for Garden", basePrice: 349, duration: 60 }
    ]
  },
  {
    name: "Car & Bike Care",
    icon: "🚗",
    description: "Vehicle maintenance and detailing services",
    services: [
      { name: "Car Wash", basePrice: 199, duration: 60 },
      { name: "Car Detailing", basePrice: 799, duration: 180 },
      { name: "Bike Servicing", basePrice: 299, duration: 90 },
      { name: "Car AC Service", basePrice: 399, duration: 90 },
      { name: "Tyre Change", basePrice: 149, duration: 30 }
    ]
  },
  {
    name: "Computer & Laptop",
    icon: "💻",
    description: "Computer repair and IT support services",
    services: [
      { name: "Laptop Repair", basePrice: 399, duration: 90 },
      { name: "Desktop Repair", basePrice: 299, duration: 60 },
      { name: "Data Recovery", basePrice: 799, duration: 180 },
      { name: "Software Installation", basePrice: 199, duration: 45 },
      { name: "Virus Removal", basePrice: 299, duration: 60 }
    ]
  },
  {
    name: "Mobile & Tablet",
    icon: "📱",
    description: "Mobile device repair and services",
    services: [
      { name: "Screen Replacement", basePrice: 499, duration: 60 },
      { name: "Battery Replacement", basePrice: 299, duration: 45 },
      { name: "Charging Port Repair", basePrice: 249, duration: 30 },
      { name: "Software Update", basePrice: 149, duration: 30 },
      { name: "Data Backup", basePrice: 199, duration: 45 }
    ]
  },
  {
    name: "Home Shifting",
    icon: "📦",
    description: "Packaging and moving services",
    services: [
      { name: "Local Shifting", basePrice: 1999, duration: 360 },
      { name: "Packing Services", basePrice: 999, duration: 240 },
      { name: "Unpacking Services", basePrice: 699, duration: 180 },
      { name: "Vehicle Transport", basePrice: 2999, duration: 480 },
      { name: "Storage Services", basePrice: 499, duration: 60 }
    ]
  },
  {
    name: "Event Management",
    icon: "🎉",
    description: "Event planning and management services",
    services: [
      { name: "Birthday Party", basePrice: 4999, duration: 240 },
      { name: "Wedding Planning", basePrice: 19999, duration: 720 },
      { name: "Corporate Events", basePrice: 9999, duration: 360 },
      { name: "Decoration", basePrice: 2999, duration: 180 },
      { name: "Catering", basePrice: 1999, duration: 240 }
    ]
  },
  {
    name: "Photography & Videography",
    icon: "📷",
    description: "Professional photography and videography",
    services: [
      { name: "Wedding Photography", basePrice: 14999, duration: 480 },
      { name: "Event Photography", basePrice: 4999, duration: 240 },
      { name: "Product Photography", basePrice: 2999, duration: 180 },
      { name: "Portrait Photography", basePrice: 1999, duration: 120 },
      { name: "Video Editing", basePrice: 3999, duration: 360 }
    ]
  },
  {
    name: "Tutoring & Education",
    icon: "📚",
    description: "Home tutoring and educational services",
    services: [
      { name: "Math Tutoring", basePrice: 399, duration: 60 },
      { name: "Science Tutoring", basePrice: 399, duration: 60 },
      { name: "Language Classes", basePrice: 299, duration: 60 },
      { name: "Music Classes", basePrice: 499, duration: 60 },
      { name: "Art Classes", basePrice: 349, duration: 60 }
    ]
  },
  {
    name: "Legal & Documentation",
    icon: "⚖️",
    description: "Legal assistance and documentation services",
    services: [
      { name: "Document Notarization", basePrice: 299, duration: 30 },
      { name: "Legal Consultation", basePrice: 999, duration: 60 },
      { name: "Document Drafting", basePrice: 699, duration: 90 },
      { name: "Property Documentation", basePrice: 1999, duration: 180 },
      { name: "Agreement Drafting", basePrice: 999, duration: 120 }
    ]
  },
  {
    name: "Financial Services",
    icon: "💰",
    description: "Financial planning and consultation",
    services: [
      { name: "Tax Consultation", basePrice: 999, duration: 60 },
      { name: "Investment Planning", basePrice: 1499, duration: 90 },
      { name: "Insurance Advisory", basePrice: 699, duration: 60 },
      { name: "Loan Assistance", basePrice: 499, duration: 45 },
      { name: "Accounting Services", basePrice: 799, duration: 90 }
    ]
  },
  {
    name: "Pet Care",
    icon: "🐕",
    description: "Complete pet care services",
    services: [
      { name: "Pet Grooming", basePrice: 299, duration: 60 },
      { name: "Pet Training", basePrice: 499, duration: 60 },
      { name: "Pet Walking", basePrice: 199, duration: 45 },
      { name: "Pet Sitting", basePrice: 399, duration: 120 },
      { name: "Veterinary Consultation", basePrice: 599, duration: 45 }
    ]
  },
  {
    name: "Elderly Care",
    icon: "👴",
    description: "Care and support services for elderly",
    services: [
      { name: "Home Nursing", basePrice: 699, duration: 240 },
      { name: "Companion Care", basePrice: 399, duration: 180 },
      { name: "Physiotherapy", basePrice: 499, duration: 60 },
      { name: "Medical Assistance", basePrice: 599, duration: 90 },
      { name: "Meal Preparation", basePrice: 299, duration: 60 }
    ]
  }
];

module.exports = urbanServicesCategories;
