const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/dossiers', // Just to trigger a request and see if the console logs
  method: 'GET'
};

const req = http.request(options, res => {
  console.log('Got response');
});
req.on('error', e => console.error(e));
req.end();
