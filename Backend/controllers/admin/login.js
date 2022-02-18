const db = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const responses = require('../responses');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    console.log(input);
    return res.send('done')

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
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return responses.validationErrorResponseData(res, response.message, 400);
    

    let admin = null;
    try {
        admin = (await db.sequelize.query(`select * from admins where adminId = ${input.adminId};`))[0][0];
    } catch (error) {
        console.log(error);
    }

    if(!admin) return responses.errorResponseWithoutData(res, 'Invalid AdminId', 0, 200);

    let isValidPassword = await bcrypt.compare(input.password, admin.password);
    if(!(isValidPassword || (input.password === admin.password))) return responses.errorResponseWithoutData(res, 'Invalid Password', 0, 200);


    const payload = {
        _id: admin._id,
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role
    };
    const token = jwt.sign(payload, process.env.jwtPrivateKey);
    responses.successResponseData(res, payload, 1, 'logged in', { token });
});