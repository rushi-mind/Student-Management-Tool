const db = require('../../models');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;
    let response = {};

    const schema = Joi.object({
        semester: Joi.number().integer().min(1).max(8).required(),
        departmentId: Joi.number().integer().min(1).required(),
        pageNumber: Joi.number().integer().min(1).required(),
        pageSize: Joi.number().integer().min(1).required(),
        sort: Joi.object({
            type: Joi.string().required(),
            by: Joi.string().required()
        }).required()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
        response.status = 'fail';
        response.message = error.details[0]['message'];
    }
    if(!isValidInput) return res.status(400).send(response);

    let { semester, departmentId, pageNumber, pageSize, sort } = input;

    let query = `SELECT rollNo, firstName, lastName, email, semester, departmentId, address, bloodGroup FROM students WHERE semester = ${semester} AND departmentId = ${departmentId} ORDER BY ${sort.by} ${sort.type} LIMIT ${pageSize} OFFSET ${pageSize*(pageNumber-1)};`;

    try {
        const students = (await db.sequelize.query(query))[0];
        const totalStudents = (await db.sequelize.query(`select count(id) as total from students where semester = ${semester} and departmentId = ${departmentId};`))[0][0]['total'];
        response.status = 'ok';
        response.totalResults = totalStudents;
        response.data = students;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});