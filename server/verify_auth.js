const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const verifyAuth = async () => {
    const testEmail = `test_${Date.now()}@test.be`;
    const testPassword = 'Password123!';
    const testName = 'Test User';

    try {
        console.log('1. Testing Registration...');
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: testName,
            email: testEmail,
            password: testPassword
        });
        console.log('Registration Success:', regRes.data.message);

        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: testPassword
        });
        const token = loginRes.data.token;
        console.log('Login Success! Token received.');

        console.log('\n3. Testing Protected Route (GET /api/auth/me)...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Auth Me Success:', meRes.data.naam);

        console.log('\n4. Testing Blocked Route (no token)...');
        try {
            await axios.get(`${API_URL}/dossiers`);
            console.error('FAIL: Protected route accessed without token!');
        } catch (err) {
            console.log('Success: Blocked as expected:', err.response.status);
        }

        console.log('\nVerification completed successfully!');
    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
    }
};

verifyAuth();
