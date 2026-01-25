require('dotenv').config();

/**
 * Comprehensive URL Configuration System
 * Supports ALL possible domains, environments, and deployment scenarios
 */

const urlConfig = {
  // Environment detection
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  isStaging: process.env.NODE_ENV === 'staging',
  isTest: process.env.NODE_ENV === 'test',

  // Base URLs for different environments
  baseUrls: {
    development: {
      backend: process.env.REACT_APP_API_URL || 'http://backend.citybells.in/',
      frontend: process.env.FRONTEND_URL || 'http://localhost:5000',
      admin: process.env.ADMIN_URL || 'http://localhost:3001'
    },
    staging: {
      backend: process.env.REACT_APP_API_URL || 'http://backend.citybells.in/',
      frontend: process.env.FRONTEND_URL || 'https://staging.yourdomain.com',
      admin: process.env.ADMIN_URL || 'https://staging-admin.yourdomain.com'
    },
    production: {
      backend: process.env.REACT_APP_API_URL || 'http://backend.citybells.in/',
      frontend: process.env.FRONTEND_URL || 'https://superapp.citybells.in',
      admin: process.env.ADMIN_URL || 'https://admin.citybells.in'
    }
  },

  // Vercel deployment patterns
  vercelPatterns: {
    main: [
      'https://super-app.vercel.app',
      'https://super-app-git-main-kavinilavans-projects.vercel.app',
      'https://super-app-git-qa-kavinilavans-projects.vercel.app',
      'https://super-app-wheat-five.vercel.app',
      'https://super-app-wh-heat-five.vercel.app',
      'https://super-app-lac.vercel.app',
      'https://super-app-cz4s.vercel.app',
      'https://super-dtqbebf0s-kavinilavans-projects.vercel.app'
    ],
    admin: [
      'https://secom-admin-frontend.vercel.app',
      'https://secomadmin-main.vercel.app',
      'https://secom-admin-git-main-kavinilavans-projects.vercel.app'
    ],
    rider: [
      'https://rider-app.vercel.app',
      'https://rider-app-git-main-kavinilavans-projects.vercel.app',
      'https://rider-app-git-qa-kavinilavans-projects.vercel.app',
      'https://super-app-rider.vercel.app',
      'https://rider-super-app.vercel.app',
      'https://super-app-gwui.vercel.app'
    ]
  },

  // Custom domains (configurable via environment)
  customDomains: process.env.CUSTOM_DOMAINS
    ? process.env.CUSTOM_DOMAINS.split(',').map(domain => domain.trim())
    : [
      'https://app.citybells.in',
      'http://app.citybells.in',
      'https://superapp.citybells.in',
      'http://superapp.citybells.in',
      'https://backend.citybells.in',
      'http://backend.citybells.in',
      'https://admin.citybells.in',
      'http://admin.citybells.in',
      'https://partner.citybells.in',
      'http://partner.citybells.in',
      'https://rider.citybells.in',
      'http://rider.citybells.in'
    ],

  // Third-party service domains
  thirdPartyDomains: {
    razorpay: [
      'https://api.razorpay.com',
      'https://checkout.razorpay.com',
      'https://dashboard.razorpay.com'
    ],
    mongodb: [
      'https://cloud.mongodb.com'
    ],
    vercel: [
      'https://vercel.com'
    ]
  },

  // Local development URLs
  localUrls: [
    'http://localhost:3000',  // Backend API
    'http://localhost:3001',  // Admin Panel
    'http://localhost:3002',  // Rider App
    'http://localhost:5000',  // Super App Frontend
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:5000',
    'http://0.0.0.0:3000',
    'http://0.0.0.0:3001',
    'http://0.0.0.0:3002',
    'http://0.0.0.0:5000'
  ],

  // Mobile app origins (no origin)
  mobileOrigins: [
    null, // For mobile apps with no origin
    undefined,
    ''
  ],

  // Get current environment base URL
  getCurrentBaseUrl: () => {
    const env = urlConfig.environment;
    return urlConfig.baseUrls[env]?.backend || urlConfig.baseUrls.development.backend;
  },

  // Get all allowed origins for CORS
  getAllowedOrigins: () => {
    const origins = [
      // Local development
      ...urlConfig.localUrls,

      // Vercel deployments
      ...urlConfig.vercelPatterns.main,
      ...urlConfig.vercelPatterns.admin,
      ...urlConfig.vercelPatterns.rider,

      // Custom domains
      ...urlConfig.customDomains,

      // Third-party domains
      ...urlConfig.thirdPartyDomains.razorpay,

      // Environment variable origins
      ...(process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : []
      )
    ];

    // Remove duplicates
    return [...new Set(origins)];
  },

  // Check if origin is allowed
  isOriginAllowed: (origin) => {
    // Allow mobile apps (no origin)
    if (!origin) return true;

    const allowedOrigins = urlConfig.getAllowedOrigins();
    return allowedOrigins.includes(origin);
  },

  // Get webhook URL for current environment
  getWebhookUrl: () => {
    const baseUrl = urlConfig.getCurrentBaseUrl();
    return `${baseUrl}/api/payments/webhook`;
  },

  // Get API base URL
  getApiBaseUrl: () => {
    const baseUrl = urlConfig.getCurrentBaseUrl();
    return `${baseUrl}/api`;
  },

  // Get upload URL
  getUploadUrl: () => {
    const baseUrl = urlConfig.getCurrentBaseUrl();
    return `${baseUrl}/uploads`;
  },

  // Validate URL format
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Sanitize URL (remove trailing slashes, etc.)
  sanitizeUrl: (url) => {
    if (!url) return '';
    return url.replace(/\/+$/, ''); // Remove trailing slashes
  },

  // Build complete URL
  buildUrl: (base, path) => {
    const sanitizedBase = urlConfig.sanitizeUrl(base);
    const sanitizedPath = path ? path.replace(/^\/+/, '') : ''; // Remove leading slashes
    return sanitizedPath ? `${sanitizedBase}/${sanitizedPath}` : sanitizedBase;
  },

  // Get environment-specific configuration
  getEnvironmentConfig: () => {
    return {
      environment: urlConfig.environment,
      isProduction: urlConfig.isProduction,
      isDevelopment: urlConfig.isDevelopment,
      baseUrl: urlConfig.getCurrentBaseUrl(),
      apiUrl: urlConfig.getApiBaseUrl(),
      webhookUrl: urlConfig.getWebhookUrl(),
      uploadUrl: urlConfig.getUploadUrl(),
      allowedOrigins: urlConfig.getAllowedOrigins().length
    };
  },

  // Log current configuration
  logConfiguration: () => {
    console.log('🌐 URL Configuration:');
    console.log('Environment:', urlConfig.environment);
    console.log('Base URL:', urlConfig.getCurrentBaseUrl());
    console.log('API URL:', urlConfig.getApiBaseUrl());
    console.log('Webhook URL:', urlConfig.getWebhookUrl());
    console.log('Allowed Origins Count:', urlConfig.getAllowedOrigins().length);
    console.log('Custom Domains:', urlConfig.customDomains);
  }
};

module.exports = urlConfig; 