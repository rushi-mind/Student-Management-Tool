const Joi = require('joi');
const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;

    const schema = Joi.object({
        id: Joi.number().integer().required(),
        updateFields: Joi.object({
            name: Joi.string().required(),
            semester: Joi.number().integer().min(1).max(8).required(),
            departmentId: Joi.number().integer().required(),
            deadline: Joi.date().greater('now').required()
        })
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    }
    catch(error) {
        isValidInput = false;
    }
    if(!isValidInput) return res.status(400).send('Invalid JSON input');


    let id = input.id, updateFields = input.updateFields;
    let query = `UPDATE assignments SET`;
    if(updateFields.name) query += ` name = "${updateFields.name}",`;
    if(updateFields.deadline) query += ` deadline = "${updateFields.deadline}",`;
    if(updateFields.departmentId) query += ` departmentId = ${updateFields.departmentId},`;
    if(updateFields.semester) query += ` semester = ${updateFields.semester},`;
    query = query.substring(0, query.length-1);
    query += ` WHERE id = ${id};`;

    let response = {};
    try {
        let [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.message = 'Assignment updated successfully.';
        response.data = result;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }

    res.send(response);
});