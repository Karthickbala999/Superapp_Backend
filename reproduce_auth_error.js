const jwt = require('jsonwebtoken');
const { protect } = require('./src/middlewares/auth.middleware');

// Mock req, res, next
const mockReq = (token) => ({
    headers: {
        authorization: token ? `Bearer ${token}` : undefined
    }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const mockNext = () => {
    console.log('Next called (unexpected for invalid token)');
};

// Set Env for test
process.env.JWT_SECRET = 'test-secret';

async function runTests() {
    console.log('--- Starting Auth Middleware Verification ---\n');

    // Test 1: Invalid Signature
    console.log('Test 1: Testing Invalid Signature...');
    const invalidToken = jwt.sign({ id: '123' }, 'wrong-secret');
    const req1 = mockReq(invalidToken);
    const res1 = mockRes();

    await protect(req1, res1, mockNext);

    console.log('Response:', JSON.stringify(res1.body, null, 2));
    if (res1.body.message.includes('invalid signature')) {
        console.log('✅ PASS: Correctly identified invalid signature');
    } else {
        console.log('❌ FAIL: Message does not contain "invalid signature"');
    }
    console.log('\n');

    // Test 2: Expired Token
    console.log('Test 2: Testing Expired Token...');
    const expiredToken = jwt.sign({ id: '123' }, 'test-secret', { expiresIn: '-1s' });
    const req2 = mockReq(expiredToken);
    const res2 = mockRes();

    await protect(req2, res2, mockNext);

    console.log('Response:', JSON.stringify(res2.body, null, 2));
    if (res2.body.message.includes('jwt expired')) {
        console.log('✅ PASS: Correctly identified expired token');
    } else {
        console.log('❌ FAIL: Message does not contain "jwt expired"');
    }
    console.log('\n');

    // Test 3: Malformed Token
    console.log('Test 3: Testing Malformed Token...');
    const req3 = mockReq('not-a-valid-token');
    const res3 = mockRes();

    await protect(req3, res3, mockNext);

    console.log('Response:', JSON.stringify(res3.body, null, 2));
    if (res3.body.message && (res3.body.message.includes('jwt malformed') || res3.body.message.includes('Unexpected token'))) {
        // jwt malformed depends on library version/input, but usually "jwt malformed"
        console.log('✅ PASS: Correctly identified malformed token');
    } else {
        console.log('❌ FAIL: Message does not contain "jwt malformed" or similar');
    }
}

runTests().catch(console.error);
