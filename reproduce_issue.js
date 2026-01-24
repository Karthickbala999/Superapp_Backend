const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const USER_EMAIL = `testuser_${TIMESTAMP}@example.com`;
const USER_PASSWORD = 'password123';
const USER_NAME = 'Test User';
const USER_PHONE = '1234567890';

// Colors for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

async function run() {
    try {
        console.log(`${colors.blue}=== Starting Reproduction Script ===${colors.reset}`);

        // 1. Register User
        console.log(`\n${colors.yellow}1. Registering new user: ${USER_EMAIL}${colors.reset}`);
        let registerRes;
        try {
            registerRes = await axios.post(`${API_URL}/auth/register`, {
                name: USER_NAME,
                email: USER_EMAIL,
                password: USER_PASSWORD,
                phone: USER_PHONE,
                role: 'user'
            });
            console.log(`${colors.green}✓ Registration successful${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}✗ Registration failed:${colors.reset}`, error.response?.data || error.message);
            return;
        }

        const token = registerRes.data.data.token;
        const initialUser = registerRes.data.data.user;

        // 2. Login (just to be sure)
        console.log(`\n${colors.yellow}2. Logging in...${colors.reset}`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: USER_EMAIL,
            password: USER_PASSWORD
        });
        console.log(`${colors.green}✓ Login successful${colors.reset}`);
        const authToken = loginRes.data.data.token;

        // 3. Update Profile (Name and Address)
        const NEW_NAME = 'Updated Name ' + TIMESTAMP;
        const NEW_PHONE = '0987654321';
        const ADDRESS = '123 Test St';
        const CITY = 'Test City';

        console.log(`\n${colors.yellow}3. Updating profile via /api/userProfile${colors.reset}`);
        console.log(`   Attempting to update Name to: "${NEW_NAME}"`);
        console.log(`   Attempting to update Phone to: "${NEW_PHONE}"`);
        console.log(`   Attempting to update Address to: "${ADDRESS}"`);

        try {
            const updateRes = await axios.put(`${API_URL}/userProfile`, {
                name: NEW_NAME,     // Field from User model
                phone: NEW_PHONE,   // Field from User model
                address_line1: ADDRESS, // Field from UserProfile model
                city: CITY
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log(`${colors.green}✓ Update request successful${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}✗ Update request failed:${colors.reset}`, error.response?.data || error.message);
            return;
        }

        // 4. Verify Immediate Persistence (In-memory/DB check)
        console.log(`\n${colors.yellow}4. Verifying persistence (Fetching Profile)${colors.reset}`);
        const profileRes = await axios.get(`${API_URL}/userProfile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        // Check if UserProfile data is saved
        const profileData = profileRes.data.data;
        if (profileData.address_line1 === ADDRESS) {
            console.log(`${colors.green}✓ Address saved correctly (UserProfile model)${colors.reset}`);
        } else {
            console.log(`${colors.red}✗ Address NOT saved correctly. Got: "${profileData.address_line1}"${colors.reset}`);
        }

        // Check if User data is saved (Name/Phone usually comes from User model)
        // Wait, does /api/userProfile return name/email? 
        // Let's check what it returns. The controller says: populate('user_id', 'name email phone role')
        // So checking profileRes.data.data should show user info if it's merged, or we need to check how it's returned.
        // The controller returns:
        /*
        const profileData = {
            address_line1: profile.address || '',
            ...
            profile_picture: ...
        };
        */
        // IT DOES NOT RETURN NAME/EMAIL/PHONE in the userProfile response!

        // So we need to call /api/auth/me or similar to see the User data, OR assume the frontend calls /api/users/me/profile

        // Let's call /api/users/me/profile which returns user data
        console.log(`\n${colors.yellow}5. Verifying User Model Data (Fetching /api/users/me/profile)${colors.reset}`);
        const meRes = await axios.get(`${API_URL}/users/me/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const userData = meRes.data.data;

        // CHECK NAME
        if (userData.name === NEW_NAME) {
            console.log(`${colors.green}✓ Name updated correctly (User model)${colors.reset}`);
        } else {
            console.log(`${colors.red}✗ Name NOT updated. Expected: "${NEW_NAME}", Got: "${userData.name}"${colors.reset}`);
            console.log(`${colors.red}   (This confirms the bug: User model fields were ignored during profile update)${colors.reset}`);
        }

        // CHECK PHONE
        if (userData.phone === NEW_PHONE) {
            console.log(`${colors.green}✓ Phone updated correctly (User model)${colors.reset}`);
        } else {
            console.log(`${colors.red}✗ Phone NOT updated. Expected: "${NEW_PHONE}", Got: "${userData.phone}"${colors.reset}`);
        }

        // 6. Logout and Login again (Simulate session end)
        console.log(`\n${colors.yellow}6. Simulating Logout/Login${colors.reset}`);
        // Login again
        const login2Res = await axios.post(`${API_URL}/auth/login`, {
            email: USER_EMAIL,
            password: USER_PASSWORD
        });
        const finalUser = login2Res.data.data.user;

        console.log(`${colors.blue}=== Final Result after Re-login ===${colors.reset}`);
        console.log(`Name: ${finalUser.name} (Expected: ${NEW_NAME})`);

        if (finalUser.name !== NEW_NAME) {
            console.log(`${colors.red}FAIL: User profile data lost/not saved after re-login.${colors.reset}`);
        } else {
            console.log(`${colors.green}PASS: User profile data persisted.${colors.reset}`);
        }

    } catch (error) {
        console.error(`${colors.red}An unexpected error occurred:${colors.reset}`, error);
    }
}

run();
