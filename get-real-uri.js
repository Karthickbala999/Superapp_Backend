require('dotenv').config();
const fs = require('fs');
fs.writeFileSync('real-uri.txt', process.env.MONGODB_URI);
