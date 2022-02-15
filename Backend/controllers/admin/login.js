const db = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        adminId: Joi.number().integer().required(),
        password: Joi.string().min(6).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    }
    catch(error) {
        isValidInput = false;
        response.status = 'fail';
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return res.status(400).send(response);
    
    let admin = null;
    try {
        admin = (await db.sequelize.query(`select * from admins where adminId = ${input.adminId};`))[0][0];
    } catch (error) {
        console.log(error);
    }

    if(!admin) return res.status(400).send({ status: 'fail', message: 'Invalid AdminId' });

    let isValidPassword = await bcrypt.compare(input.password, admin.password);
    if(!(isValidPassword || (input.password === admin.password))) return res.status(400).send({ status: 'fail', message: 'Invalid Password' });

    const payload = {
        _id: admin._id,
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role
    };
    
    const token = jwt.sign(payload, process.env.jwtPrivateKey);
    response.token = token;
    response.data = {
        adminId: admin.adminId,
        role: admin.role,
        email: admin.email
    };
    res.send(response);
});