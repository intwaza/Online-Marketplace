const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000,
};

const request = http.request(options, (response) => {
  console.log(`STATUS: ${response.statusCode}`);
  if (response.statusCode >= 200 && response.statusCode < 400) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('TIMEOUT');
  process.exit(1);
});

request.end();