const http = require('http');
http.get('http://localhost:3000/body_front.png', (res) => {
  console.log('Headers:', res.headers);
});
