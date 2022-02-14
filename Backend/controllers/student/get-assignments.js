const db = require('../../models');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;

    const schema = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
    }
    if(!isValidInput) return res.status(400).send('Invalid JOSN input');

    let semester = input.semester, departmentId = input.departmentId;
    let response = {};
    let query = `SELECT name, deadline FROM assignments WHERE semester = ${semester} AND departmentId = ${departmentId};`;
    try {
        let [result, metadata] = await db.sequelize.query(query);
        response = result;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});