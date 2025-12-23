const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const fixOrder = async () => {
    await connectDB();
    // Use the NEW schema definition effectively by defining it here or relying on the lack of Strict mode in the update
    const Order = mongoose.model('Order', new mongoose.Schema({
        shipping_address: {
            name: String,
            email: String,
            address_line1: String,
            address_line2: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
            phone: String
        },
        billing_address: {
            name: String,
            email: String,
            // ...
        }
    }, { strict: false }), 'orders');

    try {
        // Find the most recent order
        const order = await Order.findOne().sort({ createdAt: -1 });

        if (!order) {
            console.log('No order found to fix.');
        } else {
            console.log(`Fixing order ${order.order_number}...`);

            // Initial state
            console.log('Old Shipping Name:', order.shipping_address ? order.shipping_address.name : 'undefined');

            // Update
            if (!order.shipping_address) order.shipping_address = {};
            if (!order.billing_address) order.billing_address = {};

            order.shipping_address.name = "Karthick Bala";
            order.billing_address.name = "Karthick Bala";

            // We need to mark modified because we are updating nested objects
            order.markModified('shipping_address');
            order.markModified('billing_address');

            await order.save();

            console.log('Order updated successfully.');
            console.log('New Shipping Name:', order.shipping_address.name);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

fixOrder();
