require('dotenv').config();

const razorpayConfig = {
  // Razorpay API Keys
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  
  // Webhook Configuration
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Currency (supports multiple currencies)
  currency: process.env.RAZORPAY_CURRENCY || 'INR',
  
  // Payment Methods (comma-separated string from env)
  payment_methods: process.env.RAZORPAY_PAYMENT_METHODS 
    ? process.env.RAZORPAY_PAYMENT_METHODS.split(',').map(method => method.trim()) 
    : ['card', 'netbanking', 'wallet', 'upi', 'emi'],
    
  // Timeout configuration
  timeout: parseInt(process.env.RAZORPAY_TIMEOUT) || 30000, // 30 seconds
  
  // Retry configuration
  maxRetries: parseInt(process.env.RAZORPAY_MAX_RETRIES) || 3,
  
  // Base URL for different environments
  baseUrl: process.env.RAZORPAY_BASE_URL || 'https://api.razorpay.com/v1',
  
  // Validation
  validate: () => {
    const errors = [];
    
    if (!razorpayConfig.key_id) {
      errors.push('RAZORPAY_KEY_ID is required');
    }
    
    if (!razorpayConfig.key_secret) {
      errors.push('RAZORPAY_KEY_SECRET is required');
    }
    
    if (!razorpayConfig.webhook_secret) {
      console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET is not set. Webhook verification will be disabled.');
    }
    
    if (errors.length > 0) {
      throw new Error(`Razorpay configuration errors: ${errors.join(', ')}`);
    }
    
    return true;
  },
  
  // Get configuration for Razorpay instance
  getRazorpayConfig: () => {
    return {
      key_id: razorpayConfig.key_id,
      key_secret: razorpayConfig.key_secret
    };
  },
  
  // Check if running in test mode
  isTestMode: () => {
    return razorpayConfig.environment === 'development' || 
           razorpayConfig.environment === 'test';
  },
  
  // Get webhook URL (for development)
  getWebhookUrl: () => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/api/payments/webhook`;
  },
  
  // Get public key for frontend
  getPublicKey: () => {
    return razorpayConfig.key_id;
  }
};

module.exports = razorpayConfig; 