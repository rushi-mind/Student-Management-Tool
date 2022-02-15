const Joi = require('joi');
const db = require('../../models');
const fs = require('fs');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};
    
    const schema = Joi.object({
        id: Joi.number().integer().required(),
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
        console.log(error);
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

    let obj = (await db.sequelize.query(`select * from assignments where id = ${input.id};`))[0];
    if(!obj.length) {
        try {
            fs.unlinkSync(`public/assignments/${req.file.filename}`);
        } catch(error) {
            console.log(error);
        }
        return res.status(400).send({ status: 'fail', message: 'Invalid Assignment ID' });
    }

    let { id, name, semester, departmentId, deadline } = input;

    let query = `UPDATE assignments SET name = "${name}", semester = ${semester}, departmentId = ${departmentId}, deadline = "${deadline}" WHERE id = ${id};`;

    try {
        let [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.message = 'Assignment updated successfully.';
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }

    res.send(response);
});