const { Order, OrderItem } = require('./src/models');

async function insertSampleOrders() {
  try {
    // Create sample orders
    const order1 = await Order.create({
      user_id: 1,
      order_number: `ORD-${Date.now()}-001`,
      status: 'pending',
      total_amount: 299.99,
      subtotal: 299.99,
      tax_amount: 0,
      shipping_amount: 0,
      discount_amount: 0,
      shipping_address: {
        address_line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        pincode: '10001'
      },
      billing_address: {
        address_line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        pincode: '10001'
      },
      payment_method: 'cod',
      payment_status: 'pending',
      payment_details: {}
    });

    const order2 = await Order.create({
      user_id: 2,
      order_number: `ORD-${Date.now()}-002`,
      status: 'confirmed',
      total_amount: 149.50,
      subtotal: 149.50,
      tax_amount: 0,
      shipping_amount: 0,
      discount_amount: 0,
      shipping_address: {
        address_line1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        pincode: '90210'
      },
      billing_address: {
        address_line1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        pincode: '90210'
      },
      payment_method: 'card',
      payment_status: 'paid',
      payment_details: {}
    });

    // Create order items
    await OrderItem.create({
      order_id: order1.id,
      product_id: 1,
      quantity: 2,
      price: 149.99,
      total_price: 299.98,
      product_data: {
        name: 'Sample Product 1',
        sku: 'SKU-001',
        price: 149.99
      }
    });

    await OrderItem.create({
      order_id: order2.id,
      product_id: 2,
      quantity: 1,
      price: 149.50,
      total_price: 149.50,
      product_data: {
        name: 'Sample Product 2',
        sku: 'SKU-002',
        price: 149.50
      }
    });

    console.log('Sample orders created successfully!');
    console.log('Order 1 ID:', order1.id);
    console.log('Order 2 ID:', order2.id);

  } catch (error) {
    console.error('Error creating sample orders:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  } finally {
    process.exit(0);
  }
}

insertSampleOrders(); 