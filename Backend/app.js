const express = require('express');
const index = require('./routes/index');
const app = express();

app.use(express.static('public'))
app.use('/', index);

const port = process.env.PORT || 5000;
app.listen(port, () => {console.log(`running...`);})