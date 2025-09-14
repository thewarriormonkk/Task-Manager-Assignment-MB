// Backend Testing Script
// Run with: node test-backend.js

const https = require('https');

// Replace with your actual Railway URL
const BASE_URL = 'https://your-railway-app.railway.app';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

async function testBackend() {
    console.log('🚀 Starting Backend Tests...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Endpoint...');
        const healthResponse = await makeRequest(`${BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.status === 200 ? 'PASS' : 'FAIL');
        console.log('   Response:', healthResponse.data);
        console.log('');

        // Test 2: Base Endpoint
        console.log('2. Testing Base Endpoint...');
        const baseResponse = await makeRequest(`${BASE_URL}/`);
        console.log('✅ Base Endpoint:', baseResponse.status === 200 ? 'PASS' : 'FAIL');
        console.log('   Response:', baseResponse.data);
        console.log('');

        // Test 3: User Registration
        console.log('3. Testing User Registration...');
        const registerData = JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'testpassword123'
        });

        const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(registerData)
            },
            body: registerData
        });

        console.log('✅ User Registration:', registerResponse.status === 200 || registerResponse.status === 400 ? 'PASS' : 'FAIL');
        console.log('   Response:', registerResponse.data);
        console.log('');

        // Test 4: User Login
        console.log('4. Testing User Login...');
        const loginData = JSON.stringify({
            email: 'test@example.com',
            password: 'testpassword123'
        });

        const loginResponse = await makeRequest(`${BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            },
            body: loginData
        });

        console.log('✅ User Login:', loginResponse.status === 200 ? 'PASS' : 'FAIL');
        console.log('   Response:', loginResponse.data);

        if (loginResponse.data.token) {
            console.log('   Token received:', loginResponse.data.token.substring(0, 20) + '...');
        }
        console.log('');

        // Test 5: Get Tasks (if login was successful)
        if (loginResponse.data.token) {
            console.log('5. Testing Get Tasks...');
            const tasksResponse = await makeRequest(`${BASE_URL}/api/tasks`, {
                headers: {
                    'Authorization': `Bearer ${loginResponse.data.token}`
                }
            });

            console.log('✅ Get Tasks:', tasksResponse.status === 200 ? 'PASS' : 'FAIL');
            console.log('   Response:', tasksResponse.data);
            console.log('');
        }

        console.log('🎉 Backend Testing Complete!');

    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
}

// Run the tests
testBackend();
