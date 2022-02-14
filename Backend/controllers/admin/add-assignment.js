const db = require('../../models');
const Joi = require('joi');

module.exports = async (req, res) => {
    let input = req.body;

    if(input.adminId !== req.admin.adminId) return res.status(400).send(`Invalid Auth Token`);

    const schema = Joi.object({
        adminId: Joi.number().integer().required(),
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
    }
    if(!isValidInput) return res.status(400).send('Invalid JSON input');

    let name = input.name, semester = input.semester, departmentId = input.departmentId, deadline = input.deadline;

    let query = `INSERT INTO assignments(name, semester, departmentId, deadline) VALUES("${name}", ${semester}, ${departmentId}, "${deadline}");`;
    let response = {};
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