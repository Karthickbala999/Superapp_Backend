const mongoose = require('mongoose');
const Restaurant = require('../../models/restaurant');
const Dish = require('../../models/dish');
const RestaurantCategory = require('../../models/restaurantcategory');

const seedRestaurantsAndDishes = async () => {
  try {
    console.log('🍽️ Starting Food Delivery Data Seeding...');

    // Clear existing data
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
    await RestaurantCategory.deleteMany({});

    console.log('🗑️ Cleared existing restaurant and dish data');

    // Create Restaurant Categories
    const categories = [
      {
        name: 'North Indian',
        slug: 'north-indian',
        description: 'Traditional North Indian cuisine',
        image: '/uploads/categories/north-indian.jpg',
        status: true
      },
      {
        name: 'South Indian',
        slug: 'south-indian',
        description: 'Authentic South Indian dishes',
        image: '/uploads/categories/south-indian.jpg',
        status: true
      },
      {
        name: 'Chinese',
        slug: 'chinese',
        description: 'Chinese cuisine and Indo-Chinese fusion',
        image: '/uploads/categories/chinese.jpg',
        status: true
      },
      {
        name: 'Street Food',
        slug: 'street-food',
        description: 'Popular Indian street food items',
        image: '/uploads/categories/street-food.jpg',
        status: true
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        description: 'Traditional and modern desserts',
        image: '/uploads/categories/desserts.jpg',
        status: true
      },
      {
        name: 'Fast Food',
        slug: 'fast-food',
        description: 'Quick bites and fast food',
        image: '/uploads/categories/fast-food.jpg',
        status: true
      }
    ];

    const createdCategories = await RestaurantCategory.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} restaurant categories`);

    // Create mapping for easy reference
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create Restaurants
    const restaurants = [
      {
        name: 'Tandoori Tadka',
        slug: 'tandoori-tadka',
        description: 'Authentic North Indian cuisine with traditional tandoori dishes',
        image: '/uploads/restaurants/tandoori-tadka.jpg',
        category_id: categoryMap['North Indian'],
        rating: 4.5,
        ratings_count: 1250,
        delivery_time: '35-45 mins',
        distance: '3.2 km',
        minimum_order: 200,
        delivery_fee: 0,
        cuisines: ['North Indian', 'Tandoori', 'Mughlai'],
        location: {
          area: 'Anna Nagar',
          city: 'Chennai',
          latitude: 13.0843,
          longitude: 80.2705
        },
        address: '123 Anna Nagar Main Road, Chennai',
        phone: '+91 9876543210',
        email: 'tandoori@example.com',
        opening_hours: '11:00 AM - 11:00 PM',
        offers: [
          {
            title: 'WELCOME20',
            description: '20% off on first order',
            discount_percentage: 20,
            min_order_amount: 300
          }
        ],
        status: true
      },
      {
        name: 'Madras Cafe',
        slug: 'madras-cafe',
        description: 'Traditional South Indian breakfast and meals',
        image: '/uploads/restaurants/madras-cafe.jpg',
        category_id: categoryMap['South Indian'],
        rating: 4.5,
        ratings_count: 980,
        delivery_time: '25-35 mins',
        distance: '2.8 km',
        minimum_order: 150,
        delivery_fee: 0,
        cuisines: ['South Indian', 'Dosa', 'Idli', 'Vada'],
        location: {
          area: 'T. Nagar',
          city: 'Chennai',
          latitude: 13.0418,
          longitude: 80.2341
        },
        address: '456 T. Nagar South Usman Road, Chennai',
        phone: '+91 9876543211',
        email: 'madras@example.com',
        opening_hours: '6:00 AM - 10:00 PM',
        offers: [
          {
            title: 'SAVE299',
            description: '20% OFF ABOVE ₹299',
            discount_percentage: 20,
            min_order_amount: 299
          }
        ],
        status: true
      },
      {
        name: 'Spice Route',
        slug: 'spice-route',
        description: 'Authentic Chettinad and South Indian specialties',
        image: '/uploads/restaurants/spice-route.jpg',
        category_id: categoryMap['South Indian'],
        rating: 4.2,
        ratings_count: 750,
        delivery_time: '30-40 mins',
        distance: '4.1 km',
        minimum_order: 300,
        delivery_fee: 40,
        cuisines: ['South Indian', 'Chettinad', 'Biryani'],
        location: {
          area: 'Velachery',
          city: 'Chennai',
          latitude: 12.9815,
          longitude: 80.2209
        },
        address: '789 Velachery Main Road, Chennai',
        phone: '+91 9876543212',
        email: 'spice@example.com',
        opening_hours: '12:00 PM - 11:00 PM',
        offers: [
          {
            title: 'MEGA649',
            description: '₹165 OFF ABOVE ₹649',
            discount_percentage: 0,
            min_order_amount: 649
          }
        ],
        status: true
      },
      {
        name: 'Street Eats',
        slug: 'street-eats',
        description: 'Popular Indian street food and chaat items',
        image: '/uploads/restaurants/street-eats.jpg',
        category_id: categoryMap['Street Food'],
        rating: 4.0,
        ratings_count: 620,
        delivery_time: '25-35 mins',
        distance: '1.5 km',
        minimum_order: 100,
        delivery_fee: 0,
        cuisines: ['Street Food', 'Chaat', 'Fast Food'],
        location: {
          area: 'Mylapore',
          city: 'Chennai',
          latitude: 13.0339,
          longitude: 80.2619
        },
        address: '321 Mylapore Kutchery Road, Chennai',
        phone: '+91 9876543213',
        email: 'street@example.com',
        opening_hours: '4:00 PM - 12:00 AM',
        offers: [
          {
            title: 'CHAAT499',
            description: '₹120 OFF ABOVE ₹499',
            discount_percentage: 0,
            min_order_amount: 499
          }
        ],
        status: true
      }
    ];

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`✅ Created ${createdRestaurants.length} restaurants`);

    // Create mapping for easy reference
    const restaurantMap = {};
    createdRestaurants.forEach(rest => {
      restaurantMap[rest.name] = rest._id;
    });

    // Create Dishes for each restaurant
    const dishes = [
      // Tandoori Tadka dishes
      {
        name: 'Butter Chicken',
        slug: 'butter-chicken',
        description: 'Tender chicken pieces in a rich buttery tomato gravy',
        image: '/uploads/dishes/butter-chicken.jpg',
        restaurant_id: restaurantMap['Tandoori Tadka'],
        price: 250,
        original_price: 300,
        category: 'north-indian',
        preparation_time: '15-20 mins',
        rating: 4.7,
        reviews_count: 342,
        is_veg: false,
        is_bestseller: true,
        is_trending: true,
        trending_rank: 1,
        spice_level: 'medium',
        serves: 2,
        calories: 480,
        ingredients: ['Chicken', 'Tomato', 'Butter', 'Cream', 'Spices'],
        status: true
      },
      {
        name: 'Paneer Tikka',
        slug: 'paneer-tikka',
        description: 'Grilled cottage cheese marinated in spices',
        image: '/uploads/dishes/paneer-tikka.jpg',
        restaurant_id: restaurantMap['Tandoori Tadka'],
        price: 220,
        original_price: 250,
        category: 'north-indian',
        preparation_time: '10-15 mins',
        rating: 4.5,
        reviews_count: 278,
        is_veg: true,
        is_bestseller: true,
        spice_level: 'medium',
        serves: 1,
        calories: 320,
        ingredients: ['Paneer', 'Yogurt', 'Spices', 'Capsicum', 'Onion'],
        status: true
      },
      {
        name: 'Dal Makhani',
        slug: 'dal-makhani',
        description: 'Creamy black lentils cooked with butter and spices',
        image: '/uploads/dishes/dal-makhani.jpg',
        restaurant_id: restaurantMap['Tandoori Tadka'],
        price: 180,
        category: 'north-indian',
        preparation_time: '10-15 mins',
        rating: 4.4,
        reviews_count: 215,
        is_veg: true,
        spice_level: 'mild',
        serves: 2,
        calories: 280,
        ingredients: ['Black Dal', 'Butter', 'Cream', 'Tomato', 'Spices'],
        status: true
      },
      {
        name: 'Gulab Jamun',
        slug: 'gulab-jamun-tandoori',
        description: 'Deep-fried milk balls soaked in sugar syrup',
        image: '/uploads/dishes/gulab-jamun.jpg',
        restaurant_id: restaurantMap['Tandoori Tadka'],
        price: 120,
        original_price: 150,
        category: 'desserts',
        preparation_time: '5 mins',
        rating: 4.8,
        reviews_count: 312,
        is_veg: true,
        is_trending: true,
        trending_rank: 3,
        spice_level: 'mild',
        serves: 4,
        calories: 150,
        ingredients: ['Milk Powder', 'Sugar', 'Cardamom', 'Rose Water'],
        status: true
      },

      // Madras Cafe dishes
      {
        name: 'Masala Dosa',
        slug: 'masala-dosa',
        description: 'Crispy rice crepe filled with spiced potatoes',
        image: '/uploads/dishes/masala-dosa.jpg',
        restaurant_id: restaurantMap['Madras Cafe'],
        price: 180,
        original_price: 220,
        category: 'south-indian',
        preparation_time: '10-15 mins',
        rating: 4.4,
        reviews_count: 195,
        is_veg: true,
        is_bestseller: true,
        is_trending: true,
        trending_rank: 2,
        spice_level: 'mild',
        serves: 1,
        calories: 380,
        ingredients: ['Rice', 'Urad Dal', 'Potato', 'Mustard Seeds', 'Curry Leaves'],
        status: true
      },
      {
        name: 'Idli Sambar',
        slug: 'idli-sambar',
        description: 'Steamed rice cakes served with lentil soup',
        image: '/uploads/dishes/idli-sambar.jpg',
        restaurant_id: restaurantMap['Madras Cafe'],
        price: 120,
        category: 'south-indian',
        preparation_time: '5-10 mins',
        rating: 4.2,
        reviews_count: 156,
        is_veg: true,
        spice_level: 'mild',
        serves: 1,
        calories: 250,
        ingredients: ['Rice', 'Urad Dal', 'Toor Dal', 'Vegetables', 'Tamarind'],
        status: true
      },
      {
        name: 'Filter Coffee',
        slug: 'filter-coffee',
        description: 'Traditional South Indian filter coffee',
        image: '/uploads/dishes/filter-coffee.jpg',
        restaurant_id: restaurantMap['Madras Cafe'],
        price: 60,
        category: 'beverages',
        preparation_time: '5 mins',
        rating: 4.6,
        reviews_count: 245,
        is_veg: true,
        spice_level: 'mild',
        serves: 1,
        calories: 80,
        ingredients: ['Coffee Powder', 'Milk', 'Sugar'],
        status: true
      },

      // Spice Route dishes
      {
        name: 'Chettinad Chicken',
        slug: 'chettinad-chicken',
        description: 'Spicy chicken curry with Chettinad spices',
        image: '/uploads/dishes/chettinad-chicken.jpg',
        restaurant_id: restaurantMap['Spice Route'],
        price: 320,
        category: 'south-indian',
        preparation_time: '20-25 mins',
        rating: 4.6,
        reviews_count: 287,
        is_veg: false,
        spice_level: 'spicy',
        serves: 2,
        calories: 420,
        ingredients: ['Chicken', 'Chettinad Spices', 'Coconut', 'Curry Leaves'],
        status: true
      },
      {
        name: 'Vegetable Biryani',
        slug: 'vegetable-biryani',
        description: 'Fragrant rice cooked with mixed vegetables and spices',
        image: '/uploads/dishes/veg-biryani.jpg',
        restaurant_id: restaurantMap['Spice Route'],
        price: 240,
        category: 'hyderabadi',
        preparation_time: '15-20 mins',
        rating: 4.3,
        reviews_count: 198,
        is_veg: true,
        spice_level: 'medium',
        serves: 1,
        calories: 520,
        ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Biryani Spices', 'Saffron'],
        status: true
      },
      {
        name: 'Kulfi',
        slug: 'kulfi-spice-route',
        description: 'Traditional Indian ice cream with pistachios',
        image: '/uploads/dishes/kulfi.jpg',
        restaurant_id: restaurantMap['Spice Route'],
        price: 90,
        category: 'desserts',
        preparation_time: '5 mins',
        rating: 4.8,
        reviews_count: 301,
        is_veg: true,
        spice_level: 'mild',
        serves: 1,
        calories: 180,
        ingredients: ['Milk', 'Sugar', 'Pistachios', 'Cardamom'],
        status: true
      },

      // Street Eats dishes
      {
        name: 'Pani Puri',
        slug: 'pani-puri',
        description: 'Crispy puris filled with spicy water and potatoes',
        image: '/uploads/dishes/pani-puri.jpg',
        restaurant_id: restaurantMap['Street Eats'],
        price: 80,
        original_price: 100,
        category: 'street-food',
        preparation_time: '5-10 mins',
        rating: 4.9,
        reviews_count: 312,
        is_veg: true,
        is_bestseller: true,
        spice_level: 'spicy',
        serves: 6,
        calories: 120,
        ingredients: ['Semolina', 'Potato', 'Chickpeas', 'Tamarind', 'Mint'],
        status: true
      },
      {
        name: 'Pav Bhaji',
        slug: 'pav-bhaji',
        description: 'Spiced vegetable mash served with buttered buns',
        image: '/uploads/dishes/pav-bhaji.jpg',
        restaurant_id: restaurantMap['Street Eats'],
        price: 150,
        category: 'street-food',
        preparation_time: '10-15 mins',
        rating: 4.5,
        reviews_count: 245,
        is_veg: true,
        spice_level: 'medium',
        serves: 1,
        calories: 450,
        ingredients: ['Mixed Vegetables', 'Pav Bread', 'Butter', 'Spices'],
        status: true
      },
      {
        name: 'Bhel Puri',
        slug: 'bhel-puri',
        description: 'Puffed rice with vegetables and tangy chutneys',
        image: '/uploads/dishes/bhel-puri.jpg',
        restaurant_id: restaurantMap['Street Eats'],
        price: 90,
        category: 'street-food',
        preparation_time: '5-10 mins',
        rating: 4.4,
        reviews_count: 213,
        is_veg: true,
        spice_level: 'medium',
        serves: 1,
        calories: 200,
        ingredients: ['Puffed Rice', 'Onion', 'Tomato', 'Chutneys', 'Sev'],
        status: true
      }
    ];

    const createdDishes = await Dish.insertMany(dishes);
    console.log(`✅ Created ${createdDishes.length} dishes`);

    console.log('🎊 Food Delivery Data Seeding Completed Successfully!');
    console.log(`📊 Summary:
    - ${createdCategories.length} Restaurant Categories
    - ${createdRestaurants.length} Restaurants
    - ${createdDishes.length} Dishes
    `);

    return {
      categories: createdCategories,
      restaurants: createdRestaurants,
      dishes: createdDishes
    };

  } catch (error) {
    console.error('❌ Food Delivery Seeding Error:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  const { initializeDatabase } = require('../../config/database');
  
  initializeDatabase().then(() => {
    console.log('📦 Connected to MongoDB for Food Delivery seeding...');
    return seedRestaurantsAndDishes();
  }).then(() => {
    console.log('✅ Food Delivery seeding completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Food Delivery seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedRestaurantsAndDishes; 