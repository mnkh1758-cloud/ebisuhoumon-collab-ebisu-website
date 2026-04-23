const http = require('http');
http.get('http://localhost:3000/body_front.png', (res) => {
  console.log('body_front.png status:', res.statusCode, res.headers['content-type']);
});
http.get('http://localhost:3000/body_handFoot.webp', (res) => {
  console.log('body_handFoot.webp status:', res.statusCode, res.headers['content-type']);
});
