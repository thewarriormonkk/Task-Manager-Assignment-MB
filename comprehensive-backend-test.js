// Comprehensive Backend Testing Script
// Run with: node comprehensive-backend-test.js

const https = require('https');
const http = require('http');

// Your Railway app URL
const BASE_URL = 'https://web-production-0220f.up.railway.app';

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
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

// Test helper function
function runTest(testName, testFunction) {
    return new Promise(async (resolve) => {
        testResults.total++;
        try {
            const result = await testFunction();
            if (result.passed) {
                testResults.passed++;
                console.log(`✅ ${testName}: PASS`);
                if (result.details) console.log(`   ${result.details}`);
            } else {
                testResults.failed++;
                console.log(`❌ ${testName}: FAIL`);
                console.log(`   Expected: ${result.expected}`);
                console.log(`   Got: ${result.actual}`);
                if (result.details) console.log(`   ${result.details}`);
            }
            testResults.details.push({ name: testName, ...result });
        } catch (error) {
            testResults.failed++;
            console.log(`❌ ${testName}: ERROR - ${error.message}`);
            testResults.details.push({ name: testName, passed: false, error: error.message });
        }
        console.log('');
        resolve();
    });
}

// Test functions
async function testHealthEndpoint() {
    const response = await makeRequest(`${BASE_URL}/health`);
    return {
        passed: response.status === 200 && response.data.status === 'OK',
        expected: '200 status with status: OK',
        actual: `${response.status} status with data: ${JSON.stringify(response.data)}`
    };
}

async function testBaseEndpoint() {
    const response = await makeRequest(`${BASE_URL}/`);
    return {
        passed: response.status === 200 && response.data.includes('API is running'),
        expected: '200 status with "API is running" message',
        actual: `${response.status} status with data: ${response.data}`
    };
}

// User Registration Tests
async function testValidUserRegistration() {
    const userData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const response = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    return {
        passed: response.status === 201 && response.data.success === true && response.data.token,
        expected: '201 status with success: true and token',
        actual: `${response.status} status with success: ${response.data.success}`,
        details: `User created: ${userData.email}`,
        userData: userData,
        token: response.data.token
    };
}

async function testDuplicateUserRegistration() {
    const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'testpassword123'
    };

    // First registration
    await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    // Second registration (should fail)
    const response = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    return {
        passed: response.status === 400 && response.data.message === 'Email already registered',
        expected: '400 status with "Email already registered" message',
        actual: `${response.status} status with message: ${response.data.message}`
    };
}

async function testInvalidEmailRegistration() {
    const userData = {
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'testpassword123'
    };

    const response = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    return {
        passed: response.status === 400,
        expected: '400 status for invalid email',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

async function testShortPasswordRegistration() {
    const userData = {
        name: 'Short Password User',
        email: 'shortpass@example.com',
        password: '123'
    };

    const response = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    return {
        passed: response.status === 400,
        expected: '400 status for password too short',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

async function testLongNameRegistration() {
    const userData = {
        name: 'A'.repeat(51), // 51 characters (exceeds 50 char limit)
        email: 'longname@example.com',
        password: 'testpassword123'
    };

    const response = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    return {
        passed: response.status === 400,
        expected: '400 status for name too long',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

async function testMissingFieldsRegistration() {
    const userData = {
        name: 'Missing Fields User'
        // Missing email and password
    };

    const response = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    return {
        passed: response.status === 400,
        expected: '400 status for missing required fields',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

// User Login Tests
async function testValidUserLogin() {
    // First create a user
    const userData = {
        name: 'Login Test User',
        email: `logintest${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    // Now test login
    const loginData = {
        email: userData.email,
        password: userData.password
    };

    const response = await makeRequest(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
        },
        body: JSON.stringify(loginData)
    });

    return {
        passed: response.status === 200 && response.data.success === true && response.data.token,
        expected: '200 status with success: true and token',
        actual: `${response.status} status with success: ${response.data.success}`,
        details: `Login successful for: ${userData.email}`,
        token: response.data.token
    };
}

async function testInvalidCredentialsLogin() {
    const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
    };

    const response = await makeRequest(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
        },
        body: JSON.stringify(loginData)
    });

    return {
        passed: response.status === 401 && response.data.message === 'Invalid credentials',
        expected: '401 status with "Invalid credentials" message',
        actual: `${response.status} status with message: ${response.data.message}`
    };
}

async function testMissingCredentialsLogin() {
    const loginData = {
        email: 'test@example.com'
        // Missing password
    };

    const response = await makeRequest(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
        },
        body: JSON.stringify(loginData)
    });

    return {
        passed: response.status === 400 && response.data.message === 'Please provide an email and password',
        expected: '400 status with "Please provide an email and password" message',
        actual: `${response.status} status with message: ${response.data.message}`
    };
}

// Task Management Tests
async function testCreateTask() {
    // First create a user and get token
    const userData = {
        name: 'Task Creator',
        email: `taskcreator${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    const token = registerResponse.data.token;

    // Create a task
    const taskData = {
        title: 'Test Task',
        description: 'This is a test task description',
        dueDate: '2024-12-31T23:59:59.000Z',
        priority: 'high',
        status: 'pending'
    };

    const response = await makeRequest(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(taskData))
        },
        body: JSON.stringify(taskData)
    });

    return {
        passed: response.status === 201 && response.data.success === true && response.data.data.title === taskData.title,
        expected: '201 status with task created successfully',
        actual: `${response.status} status with success: ${response.data.success}`,
        details: `Task created: ${taskData.title}`,
        taskId: response.data.data._id,
        token: token
    };
}

async function testCreateTaskWithoutAuth() {
    const taskData = {
        title: 'Unauthorized Task',
        description: 'This should fail',
        dueDate: '2024-12-31T23:59:59.000Z'
    };

    const response = await makeRequest(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(taskData))
        },
        body: JSON.stringify(taskData)
    });

    return {
        passed: response.status === 401,
        expected: '401 status for unauthorized request',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

async function testCreateTaskMissingFields() {
    // Get a valid token first
    const userData = {
        name: 'Task Tester',
        email: `tasktester${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    const token = registerResponse.data.token;

    // Create task with missing required fields
    const taskData = {
        title: 'Incomplete Task'
        // Missing description and dueDate
    };

    const response = await makeRequest(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(taskData))
        },
        body: JSON.stringify(taskData)
    });

    return {
        passed: response.status === 400,
        expected: '400 status for missing required fields',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

async function testGetTasks() {
    // Get a valid token first
    const userData = {
        name: 'Task Getter',
        email: `taskgetter${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    const token = registerResponse.data.token;

    // Get tasks
    const response = await makeRequest(`${BASE_URL}/api/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        passed: response.status === 200 && response.data.success === true,
        expected: '200 status with tasks list',
        actual: `${response.status} status with success: ${response.data.success}`,
        details: `Found ${response.data.count || 0} tasks`
    };
}

async function testGetTasksWithPagination() {
    // Get a valid token first
    const userData = {
        name: 'Pagination Tester',
        email: `pagination${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    const token = registerResponse.data.token;

    // Get tasks with pagination
    const response = await makeRequest(`${BASE_URL}/api/tasks?page=1&limit=2`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        passed: response.status === 200 && response.data.pagination,
        expected: '200 status with pagination info',
        actual: `${response.status} status with pagination: ${!!response.data.pagination}`,
        details: `Pagination: ${JSON.stringify(response.data.pagination)}`
    };
}

async function testUpdateTaskStatus() {
    // Create user and task first
    const userData = {
        name: 'Status Updater',
        email: `statusupdater${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    const token = registerResponse.data.token;

    // Create a task
    const taskData = {
        title: 'Status Test Task',
        description: 'Testing status update',
        dueDate: '2024-12-31T23:59:59.000Z'
    };

    const createResponse = await makeRequest(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(taskData))
        },
        body: JSON.stringify(taskData)
    });

    const taskId = createResponse.data.data._id;

    // Update task status
    const statusData = { status: 'in-progress' };
    const response = await makeRequest(`${BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(statusData))
        },
        body: JSON.stringify(statusData)
    });

    return {
        passed: response.status === 200 && response.data.data.status === 'in-progress',
        expected: '200 status with updated status',
        actual: `${response.status} status with status: ${response.data.data?.status}`,
        details: `Status updated to: ${response.data.data?.status}`
    };
}

async function testInvalidTaskStatus() {
    // Get a valid token first
    const userData = {
        name: 'Invalid Status Tester',
        email: `invalidstatus${Date.now()}@example.com`,
        password: 'testpassword123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(userData))
        },
        body: JSON.stringify(userData)
    });

    const token = registerResponse.data.token;

    // Create a task
    const taskData = {
        title: 'Invalid Status Task',
        description: 'Testing invalid status',
        dueDate: '2024-12-31T23:59:59.000Z'
    };

    const createResponse = await makeRequest(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(taskData))
        },
        body: JSON.stringify(taskData)
    });

    const taskId = createResponse.data.data._id;

    // Try to update with invalid status
    const statusData = { status: 'invalid-status' };
    const response = await makeRequest(`${BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(JSON.stringify(statusData))
        },
        body: JSON.stringify(statusData)
    });

    return {
        passed: response.status === 400,
        expected: '400 status for invalid status',
        actual: `${response.status} status`,
        details: `Error: ${response.data.message || response.data}`
    };
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Backend Tests...\n');
    console.log(`Testing URL: ${BASE_URL}\n`);

    // Basic connectivity tests
    await runTest('Health Endpoint', testHealthEndpoint);
    await runTest('Base Endpoint', testBaseEndpoint);

    // User registration tests
    console.log('📝 USER REGISTRATION TESTS');
    console.log('========================');
    await runTest('Valid User Registration', testValidUserRegistration);
    await runTest('Duplicate User Registration', testDuplicateUserRegistration);
    await runTest('Invalid Email Registration', testInvalidEmailRegistration);
    await runTest('Short Password Registration', testShortPasswordRegistration);
    await runTest('Long Name Registration', testLongNameRegistration);
    await runTest('Missing Fields Registration', testMissingFieldsRegistration);

    // User login tests
    console.log('🔐 USER LOGIN TESTS');
    console.log('==================');
    await runTest('Valid User Login', testValidUserLogin);
    await runTest('Invalid Credentials Login', testInvalidCredentialsLogin);
    await runTest('Missing Credentials Login', testMissingCredentialsLogin);

    // Task management tests
    console.log('📋 TASK MANAGEMENT TESTS');
    console.log('=======================');
    await runTest('Create Task', testCreateTask);
    await runTest('Create Task Without Auth', testCreateTaskWithoutAuth);
    await runTest('Create Task Missing Fields', testCreateTaskMissingFields);
    await runTest('Get Tasks', testGetTasks);
    await runTest('Get Tasks With Pagination', testGetTasksWithPagination);
    await runTest('Update Task Status', testUpdateTaskStatus);
    await runTest('Invalid Task Status', testInvalidTaskStatus);

    // Print summary
    console.log('📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.details
            .filter(test => !test.passed)
            .forEach(test => {
                console.log(`- ${test.name}: ${test.error || test.actual}`);
            });
    }

    console.log('\n🎉 Testing Complete!');
}

// Run the tests
runAllTests().catch(console.error);
