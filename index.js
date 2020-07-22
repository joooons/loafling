const express = require('express');
const app = express();
const http = require('http');

http.createServer(app).listen(3000);

app.get('/', (req,res) => {
    res.send('<div>Hello!</div>');
});