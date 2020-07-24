

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';


const express = require('express');
const app = express();

app.use( (req,res) => {
  res.sendFile( INDEX, { root: __dirname } );
});

app.listen( PORT, () => {
  console.log(`Listening on ${PORT}`);
});


