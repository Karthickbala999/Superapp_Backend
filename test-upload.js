const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const upload = async () => {
    try {
        const filePath = path.join(__dirname, 'test-image.png');
        fs.writeFileSync(filePath, 'dummy content');

        const form = new FormData();
        form.append('fullName', 'Test Upload');
        form.append('phoneNumber', '+919999999999');
        form.append('email', 'test@upload.com');
        form.append('address', '123 Test St');
        form.append('city', 'Test City');
        form.append('state', 'Test State');
        form.append('pincode', '123456');
        form.append('documents', fs.createReadStream(filePath));

        console.log('Uploading to localhost:5000...');
        const res = await axios.post('http://localhost:5000/api/auth/partner/upload-documents', form, {
            headers: { ...form.getHeaders() }
        });

        console.log('Success!');
        // Check finding the file
        if (res.data.partner) {
            console.log('Partner ID:', res.data.partner.id);
        }

    } catch (err) {
        console.error('Upload failed:', err.message);
        if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    }
};

upload();
