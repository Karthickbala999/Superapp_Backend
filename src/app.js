const express = require('express');
const cors = require('cors');
const path = require('path');

// Import all models to ensure they are initialized
require('./models');

// Import comprehensive URL configuration
const urlConfig = require('./config/url.config');
const groceryOrderRoutes = require('./routes/groceryOrder.routes');
const hotelRoutes = require('./routes/hotel.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const adminOrderRoutes = require('./routes/adminOrder.routes');
const adminProfileRoutes = require('./routes/adminProfile.routes');
const brandRoutes = require('./routes/brand.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const sizeRoutes = require('./routes/size.routes');
const colorRoutes = require('./routes/color.routes');
const unitRoutes = require('./routes/unit.routes');
const groceryRoutes = require('./routes/grocery.routes');
const partnerAdminRoutes = require('./routes/partnerAdmin.routes');
const gwishlistRoutes = require('./routes/gwishlist.routes');
const staffRoutes = require('./routes/staff.routes');
const productAttributeRoutes = require('./routes/productAttribute.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const dishRoutes = require('./routes/dish.routes');
const foodCartRoutes = require('./routes/foodCart.routes');
const foodOrderRoutes = require('./routes/foodOrder.routes');
const amenityRoutes = require('./routes/amenity.routes');
const policyRoutes = require('./routes/policy.routes');
const locationRoutes = require('./routes/location.routes');
const faqRoutes = require('./routes/faq.routes');
const uploadRoutes = require('./routes/upload.routes');
const recentTaxiLocationRoutes = require('./routes/recentTaxiLocation.routes');

// Payment module routes
const paymentRoutes = require('./routes/payment.routes');

// Porter module routes
const porterDriverRoutes = require('./routes/porterDriver.routes');
const porterVehicleRoutes = require('./routes/porterVehicle.routes');
const porterBookingRoutes = require('./routes/porterBooking.routes');

// Rider module routes
const riderRoutes = require('./routes/rider.routes');
const taxiRideRoutes = require('./routes/taxiRide.routes');
const taxiDriverRoutes = require('./routes/taxiDriver.routes');
const taxiVehicleRoutes = require('./routes/taxiVehicle.routes');

// Urban Services module routes
const urbanServicesRoutes = require('./routes/urban-services');

// Quick Links module routes
const quickLinkRoutes = require('./routes/quickLink.routes');
const userProfileRoutes = require('./routes/userProfile.routes');
const savedAddressRoutes = require('./routes/savedaddresses');
const partnerAuthRoutes = require('./routes/partnerAuth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permission.routes');

const app = express();

// ✅ Comprehensive CORS configuration using URL config system
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin (mobile app/Postman)');
      return callback(null, true);
    }

    // Use the comprehensive URL configuration system
    if (urlConfig.isOriginAllowed(origin)) {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ CORS: Development mode - allowing origin: ${origin}`);
        console.log(`💡 In production, add this origin to ALLOWED_ORIGINS environment variable`);
        return callback(null, true);
      }

      console.log(`🚫 CORS blocked origin: ${origin}`);
      console.log(`💡 To allow this origin, add it to ALLOWED_ORIGINS environment variable`);
      console.log(`💡 Current allowed origins:`, urlConfig.getAllowedOrigins());
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-razorpay-signature', // For Razorpay webhooks
    'x-razorpay-payment-id',
    'x-razorpay-order-id',
    'x-razorpay-entity',
    'x-razorpay-timestamp'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// ✅ Body parsers with increased limits for images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Payload too large error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large. Please use a smaller image (max 10MB).'
    });
  }
  next(err);
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    debug_check: "ANTIGRAVITY_EDITED_THIS_FILE"
  });
});

const gcartRoutes = require('./routes/gcart.routes');
app.use('/api/gcart', gcartRoutes);


// ✅ Serve uploaded files from the 'uploads' directory (not 'public/uploads')
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes); // Admin order routes
app.use('/api/admin', adminProfileRoutes);      // ✅ Admin Profile routes (must be before generic admin routes)
app.use('/api/admin', brandRoutes);     // /admin/brands
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);    // User order routes
app.use('/api/admin', sizeRoutes);      // /admin/sizes
app.use('/api/admin', colorRoutes);     // /admin/colors
app.use('/api/admin', unitRoutes);      // /admin/units
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/partners', partnerAdminRoutes);     // ✅ Grocery cart items
app.use('/api/gwishlist', gwishlistRoutes);
app.use('/api/gorders', groceryOrderRoutes); // ✅ Grocery wishlist
app.use('/api/taxi-rides', taxiRideRoutes);
app.use('/api/taxi-drivers', taxiDriverRoutes);
app.use('/api/taxi-vehicles', taxiVehicleRoutes);
app.use('/api/taxi/recent-locations', recentTaxiLocationRoutes);

// Payment module routes
app.use('/api/payments', paymentRoutes);

// Porter module routes
app.use('/api/porter-drivers', porterDriverRoutes);
app.use('/api/porter-vehicles', porterVehicleRoutes);
app.use('/api/porter-bookings', porterBookingRoutes);

// Rider module routes
app.use('/api/riders', riderRoutes);

// Urban Services module routes
app.use('/api/urban-services', urbanServicesRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Quick Links module routes
app.use('/api/quick-links', quickLinkRoutes);

app.use('/api/users', userRoutes);      // ✅ User management
app.use('/api/saved-addresses', savedAddressRoutes);
app.use('/api/userProfile', userProfileRoutes); // ✅ User profile management
app.use('/api/roles', roleRoutes);      // ✅ Role management
app.use('/api/permissions', permissionRoutes); // ✅ Permission management
app.use('/api/staff', staffRoutes);     // ✅ Staff management
app.use('/api/grocery-orders', groceryOrderRoutes);
app.use('/api/product-attributes', productAttributeRoutes);
app.use('/api/restaurants', restaurantRoutes); // ✅ Restaurant management
app.use('/api/dishes', dishRoutes);
app.use('/api/food-cart', foodCartRoutes);
app.use('/api/food-orders', foodOrderRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/faqs', faqRoutes);
// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: urlConfig.getEnvironmentConfig(),
    services: {
      database: 'connected',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not_configured',
      cors: 'enabled',
      urlConfig: 'active'
    },
    urls: {
      base: urlConfig.getCurrentBaseUrl(),
      api: urlConfig.getApiBaseUrl(),
      webhook: urlConfig.getWebhookUrl(),
      uploads: urlConfig.getUploadUrl()
    },
    cors: {
      allowedOriginsCount: urlConfig.getAllowedOrigins().length,
      supportsMobileApps: true,
      supportsCustomDomains: true,
      supportsVercelDeployments: true
    }
  });
});

// ✅ URL configuration test endpoint
app.get('/urls', (req, res) => {
  res.json({
    success: true,
    message: 'Comprehensive URL Configuration System',
    timestamp: new Date().toISOString(),
    configuration: {
      environment: urlConfig.environment,
      isProduction: urlConfig.isProduction,
      isDevelopment: urlConfig.isDevelopment,
      isStaging: urlConfig.isStaging,
      isTest: urlConfig.isTest
    },
    urls: {
      current: {
        base: urlConfig.getCurrentBaseUrl(),
        api: urlConfig.getApiBaseUrl(),
        webhook: urlConfig.getWebhookUrl(),
        uploads: urlConfig.getUploadUrl()
      },
      development: urlConfig.baseUrls.development,
      staging: urlConfig.baseUrls.staging,
      production: urlConfig.baseUrls.production
    },
    supported: {
      localUrls: urlConfig.localUrls,
      vercelPatterns: urlConfig.vercelPatterns,
      customDomains: urlConfig.customDomains,
      thirdPartyDomains: urlConfig.thirdPartyDomains,
      mobileOrigins: urlConfig.mobileOrigins
    },
    cors: {
      allowedOrigins: urlConfig.getAllowedOrigins(),
      totalCount: urlConfig.getAllowedOrigins().length,
      supportsAllScenarios: true
    },
    environmentVariables: {
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      FRONTEND_URL: process.env.FRONTEND_URL,
      ADMIN_URL: process.env.ADMIN_URL,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      CUSTOM_DOMAINS: process.env.CUSTOM_DOMAINS
    }
  });
});

// ✅ Default API welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Super App API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      // Core services
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      permissions: '/api/permissions',
      staff: '/api/staff',

      // E-commerce
      categories: '/api/categories',
      products: '/api/products',
      brands: '/api/admin/brands',
      cart: '/api/cart',
      orders: '/api/orders',
      wishlist: '/api/wishlist',
      quickLinks: '/api/quick-links',

      // Hotel & Booking
      hotels: '/api/hotels',
      rooms: '/api/rooms',
      bookings: '/api/bookings',

      // Grocery
      groceries: '/api/groceries',
      gcart: '/api/gcart',
      gwishlist: '/api/gwishlist',
      gorders: '/api/gorders',

      // Food Delivery
      restaurants: '/api/restaurants',
      dishes: '/api/dishes',
      foodCart: '/api/food-cart',
      foodOrders: '/api/food-orders',

      // Transportation
      taxiRides: '/api/taxi-rides',
      taxiDrivers: '/api/taxi-drivers',
      taxiVehicles: '/api/taxi-vehicles',
      ordertracking: '/api/taxi/recent-locations',

      // Porter Services
      porters: '/api/porter-drivers',
      porterVehicles: '/api/porter-vehicles',
      porterorders: '/api/porter-bookings',

      // Rider Services
      riders: '/api/riders',

      // Payment System
      payments: '/api/payments',
      paymentTest: '/api/payments/test',
      paymentWebhook: '/api/payments/webhook',

      // Admin & Management
      admin: '/api/admin',
      adminOrders: '/api/admin/orders',

      // Support
      amenities: '/api/amenities',
      policies: '/api/policies',
      locations: '/api/locations',
      faqs: '/api/faqs',

      // System
      health: '/health'
    },
    documentation: {
      payment: 'https://razorpay.com/docs/api/',
      api: '/api/docs' // Future API documentation endpoint
    }
  });
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
