const http = require('http');
const data = JSON.stringify({ name: 'Debug User', email: 'debug@example.com', password: 'pass1234' });
const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(opts, (res) => {
  console.log('status', res.statusCode);
  res.on('data', (chunk) => process.stdout.write(chunk));
});
req.on('error', (e) => console.error('ERROR', e));
req.write(data);
req.end();
