const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        fs.writeFileSync('inspect_result.txt', 'DB Error: ' + err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }), 'orders');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

    try {
        const order = await Order.findOne().sort({ createdAt: -1 });
        let output = '';
        if (!order) {
            output += 'No order\n';
        } else {
            output += `OrderID: ${order._id}\n`;
            output += `OrderNumber: ${order.order_number}\n`;
            output += `UserID: ${order.user_id}\n`;

            // Explicitly check for name in shipping
            output += `Shipping_Name_Field: ${order.shipping_address ? order.shipping_address.name : 'N/A'}\n`;
            output += `Shipping_Full: ${JSON.stringify(order.shipping_address)}\n`;

            output += `Billing_Name_Field: ${order.billing_address ? order.billing_address.name : 'N/A'}\n`;

            output += `CustomerNameSnapshot: ${order.customer_name}\n`;

            if (order.user_id) {
                const user = await User.findById(order.user_id);
                if (user) {
                    output += `User_Name: ${user.name}\n`;
                    output += `User_Email: ${user.email}\n`;
                } else {
                    output += 'User not found\n';
                }
            }
        }
        fs.writeFileSync('inspect_result.txt', output);
        console.log('Done writing');
    } catch (e) {
        fs.writeFileSync('inspect_result.txt', 'Error: ' + e.message);
    } finally {
        mongoose.connection.close();
    }
};
run();
