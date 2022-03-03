require('dotenv').config();
const express = require('express');
const index = require('./routes/index');
const app = express();
const cors = require('cors');

app.use(express.static('public'));
app.use(cors({
    origin: process.env.ORIGINS
}));
app.use('/', index);

const port = process.env.PORT || 5000;
app.listen(port, () => { console.log(`running...`); });