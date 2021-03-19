const express = require('express');
const app = express();
const path = require('path');

const MOCK_PORT = 3334;
app.use((req, res, next) => {
  req.hostname = 'localhost.test.com';

  next();
})

app.get('/', (req, res) => {
  res.send('Ok');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/pages/login.page.html'))
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname + '/pages/home.page.html'))
});

app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname + '/pages/calendar.page.html'))
});

app.post('/leaves/month/:month/:year', (req, res) => {
  console.log('GET JSON DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  res.header("Content-Type", 'application/json');
  res.sendFile(path.join(__dirname + '/assets/response-calendar-holded.json'))
});

app.listen(MOCK_PORT, () => {
  console.log(`Mock app listening at http://localhost.test.com:${MOCK_PORT}`)
});