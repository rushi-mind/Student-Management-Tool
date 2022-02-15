const db = require('../../models');
const Joi = require('joi');
const fs = require('fs');

module.exports = async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        name: Joi.string().required(),
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().required(),
        deadline: Joi.date().greater('now').required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    }
    catch(error) {
        isValidInput = false;
        response.status = 'fail';
        response.message = error.details[0]['message'];
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {
            console.log(error);
        }
    }
    if(!isValidInput) return res.status(400).send(response);

    let { name, semester, departmentId, deadline } = input;
    let query = `INSERT INTO assignments(name, semester, departmentId, deadline) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}");`;
    
    try {
        const [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.input = input;
        res.status(200);
    } catch(error) {
        res.status(400);
        response.status = 'fail';
        response.message = 'Invalid JSON input';
        response.error = error.parent.sqlMessage;
    }
    res.send(response);
};