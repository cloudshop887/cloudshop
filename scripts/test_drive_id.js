
const https = require('https');

const id = 'pLlqDXs6tgcahaYoT';
const url = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;

https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
}).on('error', (e) => {
    console.error(e);
});
