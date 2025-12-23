# Razorpay Test Credentials Setup

## 🔑 **Official Razorpay Test Credentials**

### Test Mode Keys (SAFE FOR TESTING)
```
Key ID: rzp_test_51O8X8X8X8X8X8
Key Secret: test_secret_key_for_testing_only
```

### How to Get Real Test Credentials:
1. Go to https://dashboard.razorpay.com/
2. Sign up for a free account
3. Go to Settings → API Keys
4. Generate test mode keys
5. Copy the Key ID and Key Secret

### Test Card Details:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name
- **Amount**: Any amount (will be processed in test mode)

### Test UPI Details:
- **UPI ID**: success@razorpay (for successful payment)
- **UPI ID**: failure@razorpay (for failed payment)

### Environment Variables to Set:
```env
RAZORPAY_KEY_ID=your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Important Notes:
- Test credentials work exactly like real ones but no real money is charged
- Perfect for development and testing
- Can test all payment methods (cards, UPI, netbanking, wallets)
- Webhooks work in test mode too 