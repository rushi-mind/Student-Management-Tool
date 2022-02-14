const db = require('../../models');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;

    const schema = Joi.object({
        studentId: Joi.number().integer().required()
    });
    let isValid = true;
    try {
        isValid = await schema.validateAsync(input);
    } catch (error) {
        isValid = false;
    }
    if(!isValid) return res.status(400).send('Invalid JSON input');

    let response = {};

    if(input.studentId !== req.student.id) return res.status(400).send('Invalid auth token.');

    let query = `SELECT date, status FROM attendance WHERE studentId = ${input.studentId}`;

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