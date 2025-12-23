const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/urban-services/bookings/dummy_123/assign-partner',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
