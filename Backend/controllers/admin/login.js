const db = require('../../models');
const jwt = require('jsonwebtoken');

module.exports = (async (req, res) => {
    let input = req.body;
    let id = input.id, password = input.password;
    if(!id || !password) return res.status(400).send('Invalid JSON input');

    if(!(id === "admin")) return res.status(400).send('Invalid Admin ID');
    if(!(password === process.env.adminPassword)) return res.status(400).send('Invalid Password');

    const token = jwt.sign({ id: id }, process.env.jwtPrivateKey);
    res.header('x-auth-token', token).send(true);
});