// Import all Mongoose models
const User = require('./user');
const UserProfile = require('./userprofile');
const Category = require('./category');
const Product = require('./product');
const ProductVariation = require('./productvariation');
const Cart = require('./cart');
const CartItem = require('./cartitem');
const Order = require('./order');
const OrderItem = require('./orderitem');
const OTP = require('./otp.model');
const GroceryOrder = require('./groceryorder');  // ✅ FIX: Use Mongoose model
const GroceryOrderItem = require('./groceryorderitem');  // ✅ FIX: Use Mongoose model
const Wishlist = require('./wishlist');

// Restaurant models
const RestaurantCategory = require('./restaurantcategory');
const Restaurant = require('./restaurant');
const Dish = require('./dish');

// Food delivery models
const FoodOrder = require('./foodorder');
const FoodOrderItem = require('./foodorderitem');
const FoodCart = require('./foodcart');
const FoodCartItem = require('./foodcartitem');

// Taxi models
const TaxiDriver = require('./taxidriver');
const TaxiVehicle = require('./taxivehicle');
const TaxiRide = require('./taxiride');

// Porter models
const PorterDriver = require('./porterdriver');
const PorterVehicle = require('./portervehicle');
const PorterBooking = require('./porterbooking');

// Rider models
const Rider = require('./rider');
const OrderAssignment = require('./orderAssignment');

// Hotel models
const Hotel = require('./hotel');
const Room = require('./room');
const Booking = require('./booking');

// Other models
const ProductAttribute = require('./productattribute');
const GCartItem = require('./gcart_items');
const Gwhishlist = require('./gwhishlist');
const Role = require('./role');
const Staff = require('./staff');
const Policy = require('./policy');
const Location = require('./location');
const Brand = require('./brand');
const Amenity = require('./amenity');

// Urban Services models
const ServiceCategory = require('./urban-services/serviceCategory');
const Service = require('./urban-services/service');
const ServicePartner = require('./urban-services/servicePartner');
const ServiceBooking = require('./urban-services/serviceBooking');
const ServiceReview = require('./urban-services/serviceReview');

// Urban Services Partner models
const Partner = require('./Partner');
const UrbanOTP = require('./OTP');

// Export all models
module.exports = {
  User,
  UserProfile,
  Category,
  Product,
  ProductVariation,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OTP,
  RestaurantCategory,
  Restaurant,
  Dish,
  FoodOrder,
  FoodOrderItem,
  FoodCart,
  FoodCartItem,
  TaxiDriver,
  TaxiVehicle,
  TaxiRide,
  PorterDriver,
  PorterVehicle,
  PorterBooking,
  Rider,
  OrderAssignment,
  Hotel,
  Room,
  Booking,
  GroceryOrder,
  GroceryOrderItem,
  GCartItem,
  Gwhishlist,
  ProductAttribute,
  Role,
  Staff,
  Policy,
  Location,
  Wishlist,
  Brand,
  Amenity,
  // Urban Services
  ServiceCategory,
  Service,
  ServicePartner,
  ServiceBooking,
  ServiceReview,
  Partner,
  UrbanOTP
};
