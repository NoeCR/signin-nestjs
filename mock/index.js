const express = require('express');
const app = express();
const path = require('path');

const MOCK_PORT = 3334;

app.get('/', (req, res) => {
  res.send('Ok');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/pages/login.page.html'))
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname + '/pages/home.page.html'))
});


app.listen(MOCK_PORT, () => {
  console.log(`Mock app listening at http://localhost:${MOCK_PORT}`)
});