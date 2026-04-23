const fs = require('fs');
const buf = fs.readFileSync('public/body_back.png');
console.log(buf.slice(0, 20).toString('hex'));
const buf2 = fs.readFileSync('public/body_front.png');
console.log(buf2.slice(0, 20).toString('hex'));
