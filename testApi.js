const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/dossiers',
  method: 'GET',
  headers: {
    // Note: The UI usually sends Authorization: Bearer <token>. We might not have a token.
    // If it's authenticated, this will fail with 401. Let's see what happens.
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data.substring(0, 500)));
});
req.on('error', e => console.error(e));
req.end();
