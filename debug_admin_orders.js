const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Load Models
        const Order = require('./src/models/order');
        const GroceryOrder = require('./src/models/groceryorder');
        const FoodOrder = require('./src/models/foodorder');
        require('./src/models/user');

        const results = {};

        const debugModel = async (Model, name) => {
            console.log(`Debugging ${name}...`);

            // Find 5 most recent orders
            let query = Model.find().sort({ createdAt: -1 }).limit(5);

            // Populate based on Controller logic logic
            if (name === 'FoodOrder') {
                // FoodOrder controller populates 'user' (virtual)
                // We'll also populate 'user_id' to see if it exists independently
                query = query.populate('user').populate('user_id');
            } else {
                // Order and GroceryOrder populate 'user_id'
                query = query.populate('user_id');
            }

            const docs = await query.exec();

            results[name] = docs.map(d => {
                const obj = d.toObject({ virtuals: true });

                // Simulation of Controller Logic
                let calculatedName = "N/A";

                if (name === 'FoodOrder') {
                    if (obj.customer_name) calculatedName = obj.customer_name + " (Snapshot)";
                    else if (obj.user?.name) calculatedName = obj.user.name + " (Virtual)";
                    else if (obj.user_id?.name) calculatedName = obj.user_id.name + " (Propagated ID)";
                } else {
                    // Order / Grocery
                    let userFromId = obj.user_id; // Populated doc

                    if (userFromId && userFromId.name) {
                        calculatedName = userFromId.name + " (Propagated)";
                    }

                    if (obj.customer_name) {
                        calculatedName = obj.customer_name + " (Snapshot)";
                    } else if (obj.shipping_address?.name) {
                        // Check if fallback logic would work
                        if (calculatedName.includes("Propagated") || calculatedName === "N/A") {
                            // Controller logic: if (customer) overwrite. Else if (shipping) overwrite.
                            calculatedName = obj.shipping_address.name + " (Shipping Fallback)";
                        }
                    }
                }

                return {
                    id: obj._id,
                    order_number: obj.order_number,
                    customer_name_field: obj.customer_name,
                    shipping_addr_name: obj.shipping_address?.name,
                    // Check if user_id was populated into a Document or remains an ID
                    user_id_status: (d.user_id && d.user_id._id) ? `Doc(ID=${d.user_id._id}, Name=${d.user_id.name})` : `Null/Raw ID`,
                    user_virtual_status: (d.user && d.user._id) ? `Doc(ID=${d.user._id}, Name=${d.user.name})` : 'Null',
                    CALCULATED_DISPLAY_NAME: calculatedName
                };
            });
        };

        await debugModel(Order, 'Order');
        await debugModel(GroceryOrder, 'GroceryOrder');
        await debugModel(FoodOrder, 'FoodOrder');

        fs.writeFileSync('debug_output.json', JSON.stringify(results, null, 2));
        console.log('Written to debug_output.json');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
