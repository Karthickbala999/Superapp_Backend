const axios = require('axios');

async function verifyDeployment() {
    console.log('🔍 Checking Server Identity via /api/health ...');
    try {
        const res = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Response Received:');
        console.log(JSON.stringify(res.data, null, 2));

        if (res.data.debug_check === "ANTIGRAVITY_EDITED_THIS_FILE") {
            console.log('\n🎉 SUCCESS! The running server IS reflecting the latest file changes.');
        } else {
            console.log('\n❌ FAILURE! The running server is MISSING the debug tag.');
            console.log('   Likely cause: Using WRONG directory or server not restarted.');
        }

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
    }
}

verifyDeployment();
