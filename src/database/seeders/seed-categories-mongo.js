const mongoose = require('mongoose');
const Category = require('../../models/category');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// 1. Define parent categories
const parentCategories = [
  { name: "Men's Wear", slug: 'mens-wear', description: "Men's fashion and apparel", status: true },
  { name: "Women's Wear", slug: 'womens-wear', description: "Women's fashion and apparel", status: true },
  { name: 'Home Appliances', slug: 'home-appliances', description: 'Appliances for home use', status: true },
  { name: 'Cosmetics', slug: 'cosmetics', description: 'Beauty and personal care products', status: true },
];

// 2. Define child categories (with parent_slug)
const childCategories = [
  // Men's Wear children
  { name: 'Tops', slug: 'mens-tops', description: "Men's tops and shirts", status: true, parent_slug: 'mens-wear' },
  { name: 'Bottoms', slug: 'mens-bottoms', description: "Men's pants and shorts", status: true, parent_slug: 'mens-wear' },
  { name: 'Footwear', slug: 'mens-footwear', description: "Men's shoes and boots", status: true, parent_slug: 'mens-wear' },
  { name: 'Accessories', slug: 'mens-accessories', description: "Men's accessories and jewelry", status: true, parent_slug: 'mens-wear' },
  { name: 'Outerwear', slug: 'mens-outerwear', description: "Men's jackets and coats", status: true, parent_slug: 'mens-wear' },
  { name: 'Suits & Formals', slug: 'mens-suits-formals', description: "Men's formal wear and suits", status: true, parent_slug: 'mens-wear' },
  { name: 'Underwear & Loungewear', slug: 'mens-underwear-loungewear', description: "Men's underwear and loungewear", status: true, parent_slug: 'mens-wear' },
  { name: 'New Arrivals', slug: 'mens-new-arrivals', description: "Latest men's fashion arrivals", status: true, parent_slug: 'mens-wear' },
  { name: 'Seasonal Collections', slug: 'mens-seasonal-collections', description: "Seasonal men's fashion collections", status: true, parent_slug: 'mens-wear' },
  // Home Appliances children
  { name: 'Refrigerators', slug: 'refrigerators', description: 'All types of refrigerators', status: true, parent_slug: 'home-appliances' },
  { name: 'Washing Machines', slug: 'washing-machines', description: 'All types of washing machines', status: true, parent_slug: 'home-appliances' },
  { name: 'Air Conditioners & Coolers', slug: 'air-conditioners-coolers', description: 'Air conditioners and coolers', status: true, parent_slug: 'home-appliances' },
  { name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Kitchen appliances', status: true, parent_slug: 'home-appliances' },
  { name: 'Televisions', slug: 'televisions', description: 'All types of televisions', status: true, parent_slug: 'home-appliances' },
  { name: 'Fans & Other appliances', slug: 'fans-other', description: 'Fans and other appliances', status: true, parent_slug: 'home-appliances' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared categories');

    // Insert parent categories first
    const parentDocs = await Category.insertMany(parentCategories.map(c => ({
      ...c,
      created_at: new Date(),
      updated_at: new Date(),
    })));
    // Map slug to ObjectId
    const slugToId = {};
    parentDocs.forEach(doc => { slugToId[doc.slug] = doc._id; });

    // Insert child categories with correct parent_id
    await Category.insertMany(childCategories.map(c => ({
      ...c,
      parent_id: slugToId[c.parent_slug],
      created_at: new Date(),
      updated_at: new Date(),
    })));

    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seed(); 