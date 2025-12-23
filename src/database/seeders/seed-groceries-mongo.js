const mongoose = require('mongoose');
const Grocery = require('../../models/Grocery');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

const groceries = [
  // Fruits & Vegetables
  { name: "Broccoli", description: "Fresh green broccoli, rich in vitamins.", original_price: 100, discounted_price: 80, image: "/uploads/groceries/broccoli.jpg", rating: 4.5, is_best_seller: true, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Apple", description: "Fresh red apples, perfect for snacking.", original_price: 200, discounted_price: 150, image: "/uploads/groceries/apple.jpg", rating: 4.5, is_best_seller: true, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Carrot", description: "Crunchy orange carrots, perfect for salads.", original_price: 60, discounted_price: 50, image: "/uploads/groceries/Carrot.jpg", rating: 4.3, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Banana", description: "Ripe yellow bananas, great for smoothies.", original_price: 80, discounted_price: 60, image: "/uploads/groceries/Banana.jpg", rating: 4.0, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Tomato", description: "Red ripe tomatoes, great for sauces.", original_price: 50, discounted_price: 45, image: "/uploads/groceries/tomato.jpg", rating: 4.2, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Spinach", description: "Fresh spinach leaves, high in iron.", original_price: 70, discounted_price: 60, image: "/uploads/groceries/spinach.jpg", rating: 4.4, is_best_seller: true, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Onion", description: "Pungent onions, essential for cooking.", original_price: 50, discounted_price: 40, image: "/uploads/groceries/onion.jpg", rating: 4.1, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Cucumber", description: "Crisp cucumbers, refreshing for salads.", original_price: 30, discounted_price: 25, image: "/uploads/groceries/cucumber.jpg", rating: 4.2, is_best_seller: true, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Bell Pepper", description: "Colorful bell peppers, sweet and crunchy.", original_price: 90, discounted_price: 75, image: "/uploads/groceries/bellpeper.jpg", rating: 4.3, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Mango", description: "Sweet and juicy mangoes, seasonal delight.", original_price: 250, discounted_price: 220, image: "/uploads/groceries/mango.jpg", rating: 4.7, is_best_seller: true, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Orange", description: "Citrusy oranges, rich in Vitamin C.", original_price: 120, discounted_price: 100, image: "/uploads/groceries/orange.jpg", rating: 4.4, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  { name: "Potato", description: "Versatile potatoes, good for all dishes.", original_price: 40, discounted_price: 35, image: "/uploads/groceries/potatoe.jpg", rating: 4.0, is_best_seller: false, quantity: 1, category: "Fruits & Vegetables", status: true },
  // Bakery, Cakes & Dairy
  { name: "Milk", description: "Fresh cow milk, pasteurized and homogenized.", original_price: 60, discounted_price: 55, image: "/uploads/groceries/milk.webp", rating: 4.5, is_best_seller: true, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Cheese Block", description: "Cheddar cheese block, perfect for sandwiches.", original_price: 300, discounted_price: 280, image: "/uploads/groceries/cheese.jpg", rating: 4.2, is_best_seller: false, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Yogurt", description: "Plain yogurt, rich in probiotics.", original_price: 40, discounted_price: 35, image: "/uploads/groceries/yogurt.webp", rating: 4.0, is_best_seller: true, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Butter", description: "Unsalted butter, great for cooking and baking.", original_price: 120, discounted_price: 110, image: "/uploads/groceries/butter.webp", rating: 4.6, is_best_seller: true, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Paneer", description: "Fresh homemade paneer, soft and creamy.", original_price: 200, discounted_price: 180, image: "/uploads/groceries/paneer.webp", rating: 4.7, is_best_seller: false, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Bread", description: "Freshly baked bread, soft and delicious.", original_price: 40, discounted_price: 35, image: "/uploads/groceries/bread.png", rating: 4.0, is_best_seller: false, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Eggs", description: "Farm fresh eggs, rich in protein.", original_price: 120, discounted_price: 100, image: "/uploads/groceries/egg.png", rating: 4.6, is_best_seller: true, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Cream", description: "Thick fresh cream, perfect for desserts.", original_price: 80, discounted_price: 70, image: "/uploads/groceries/cream.webp", rating: 4.2, is_best_seller: false, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Pastries", description: "Assorted pastries, sweet treats.", original_price: 150, discounted_price: 130, image: "/uploads/groceries/pastry.png", rating: 4.5, is_best_seller: true, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Cake", description: "Freshly baked cake.", original_price: 400, discounted_price: 350, image: "/uploads/groceries/cake.png", rating: 4.6, is_best_seller: false, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Muffins", description: "Delicious chocolate muffins.", original_price: 70, discounted_price: 60, image: "/uploads/groceries/muffin.png", rating: 4.1, is_best_seller: false, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  { name: "Curd", description: "Homemade curd, rich and creamy.", original_price: 50, discounted_price: 45, image: "/uploads/groceries/curd.jpeg", rating: 4.3, is_best_seller: true, quantity: 1, category: "Bakery, Cakes & Dairy", status: true },
  // ... (continue for all other products from your SQL seeder)
];

async function seedGroceries() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Optionally clear existing groceries
    await Grocery.deleteMany({});
    console.log('Cleared existing groceries');

    // Insert new groceries
    await Grocery.insertMany(groceries);
    console.log('Groceries seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding groceries:', err);
    process.exit(1);
  }
}

seedGroceries(); 