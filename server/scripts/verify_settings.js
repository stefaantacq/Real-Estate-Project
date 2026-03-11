const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;
const TEST_USER_ID = 1;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function verify() {
    console.log('--- Starting Settings Persistence Verification ---');
    
    // 1. Generate a token for the test user
    const token = jwt.sign(
        { id: TEST_USER_ID, email: 'dev@local', name: 'Dev User' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log('Generated test token');

    try {
        // 2. Test fetching initial settings via /me
        console.log('Fetching current settings...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Current settings:', {
            customDocumentPrompt: meRes.data.customDocumentPrompt,
            customTemplatePrompt: meRes.data.customTemplatePrompt
        });

        // 3. Update settings via /settings
        const newSettings = {
            customDocumentPrompt: 'Test Document Prompt ' + Date.now(),
            customTemplatePrompt: 'Test Template Prompt ' + Date.now()
        };
        console.log('Updating settings to:', newSettings);
        const updateRes = await axios.put(`${API_URL}/auth/settings`, newSettings, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update response:', updateRes.data);

        // 4. Verify update via /me
        console.log('Verifying updated settings...');
        const meRes2 = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (meRes2.data.customDocumentPrompt === newSettings.customDocumentPrompt &&
            meRes2.data.customTemplatePrompt === newSettings.customTemplatePrompt) {
            console.log('SUCCESS: Settings persisted and correctly retrieved!');
        } else {
            console.error('FAILURE: Settings mismatch after update');
            console.log('Expected:', newSettings);
            console.log('Got:', {
                customDocumentPrompt: meRes2.data.customDocumentPrompt,
                customTemplatePrompt: meRes2.data.customTemplatePrompt
            });
        }
    } catch (error) {
        console.error('Verification failed with error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verify();
