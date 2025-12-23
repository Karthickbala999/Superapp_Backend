const mongoose = require('mongoose');
const RestaurantCategory = require('../../models/restaurantcategory');
const Restaurant = require('../../models/restaurant');
const Dish = require('../../models/dish');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
console.log('Connecting to:', MONGO_URI);

// 1. Define restaurant categories
const categories = [
  {
    name: 'Italian',
    slug: 'italian',
    description: 'Authentic Italian cuisine with pasta, pizza, and more',
    image: null,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Chinese',
    slug: 'chinese',
    description: 'Traditional Chinese dishes and flavors',
    image: null,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Indian',
    slug: 'indian',
    description: 'Spicy and flavorful Indian cuisine',
    image: null,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Fast Food',
    slug: 'fast-food',
    description: 'Quick and convenient fast food options',
    image: null,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 2. Define restaurants (category_slug will be mapped to ObjectId after category insert)
const restaurants = [
  {
    name: 'Pizza Palace',
    slug: 'pizza-palace',
    address: '123 Main Street, Downtown',
    category_slug: 'italian',
    image: null,
    average_rating: 4.5,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Golden Dragon',
    slug: 'golden-dragon',
    address: '456 Oak Avenue, Chinatown',
    category_slug: 'chinese',
    image: null,
    average_rating: 4.2,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Spice Garden',
    slug: 'spice-garden',
    address: '789 Spice Road, Little India',
    category_slug: 'indian',
    image: null,
    average_rating: 4.7,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Burger Express',
    slug: 'burger-express',
    address: '321 Fast Lane, Food Court',
    category_slug: 'fast-food',
    image: null,
    average_rating: 3.8,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 3. Define dishes (restaurant_slug will be mapped to ObjectId after restaurant insert)
const dishes = [
  // Pizza Palace
  {
    name: 'Margherita Pizza',
    slug: 'margherita-pizza',
    price: 15.99,
    description: 'Classic tomato sauce with mozzarella cheese',
    image: null,
    restaurant_name: 'Pizza Palace',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Pepperoni Pizza',
    slug: 'pepperoni-pizza',
    price: 17.99,
    description: 'Spicy pepperoni with melted cheese',
    image: null,
    restaurant_name: 'Pizza Palace',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Golden Dragon
  {
    name: 'Kung Pao Chicken',
    slug: 'kung-pao-chicken',
    price: 12.99,
    description: 'Spicy diced chicken with peanuts and vegetables',
    image: null,
    restaurant_name: 'Golden Dragon',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sweet and Sour Pork',
    slug: 'sweet-and-sour-pork',
    price: 11.99,
    description: 'Crispy pork in tangy sweet and sour sauce',
    image: null,
    restaurant_name: 'Golden Dragon',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Spice Garden
  {
    name: 'Butter Chicken',
    slug: 'butter-chicken',
    price: 14.99,
    description: 'Creamy tomato-based curry with tender chicken',
    image: null,
    restaurant_name: 'Spice Garden',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Biryani',
    slug: 'biryani',
    price: 16.99,
    description: 'Fragrant rice dish with aromatic spices',
    image: null,
    restaurant_name: 'Spice Garden',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Burger Express
  {
    name: 'Classic Burger',
    slug: 'classic-burger',
    price: 8.99,
    description: 'Juicy beef patty with lettuce, tomato, and cheese',
    image: null,
    restaurant_name: 'Burger Express',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Chicken Wings',
    slug: 'chicken-wings',
    price: 9.99,
    description: 'Crispy wings with your choice of sauce',
    image: null,
    restaurant_name: 'Burger Express',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await Dish.deleteMany({});
    await Restaurant.deleteMany({});
    await RestaurantCategory.deleteMany({});
    console.log('Cleared restaurant categories, restaurants, and dishes');

    // Insert categories
    const categoryDocs = await RestaurantCategory.insertMany(categories);
    const categorySlugToId = {};
    categoryDocs.forEach(c => { categorySlugToId[c.slug] = c._id; });

    // Insert restaurants (map category_slug to category_id)
    const restaurantDocs = await Restaurant.insertMany(restaurants.map(r => ({
      ...r,
      category_id: categorySlugToId[r.category_slug],
    })));
    const restaurantNameToId = {};
    restaurantDocs.forEach(r => { restaurantNameToId[r.name] = r._id; });

    // Insert dishes (map restaurant_name to restaurant_id)
    await Dish.insertMany(dishes.map(d => ({
      ...d,
      restaurant_id: restaurantNameToId[d.restaurant_name],
    })));

    console.log('Restaurant categories, restaurants, and dishes seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seed(); 