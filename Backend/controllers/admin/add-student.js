const db = require('../../models');
const bcrypt = require('bcrypt');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;

    if(req.admin.role !== 'admin') return res.status(403).send('Only admin has access to perform this operation');

    const schema = Joi.object({
        rollNo: Joi.number().integer().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        semester: Joi.number().integer().min(1).max(8),
        departmentId: Joi.number().integer().min(1),
        address: Joi.string(),
        bloodGroup: Joi.string()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
    }
    if(!isValidInput) return res.status(400).send('Invalid JSON input');

    let {rollNo, firstName, lastName, email, password, semester, departmentId, address, bloodGroup} = input;

    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);
    
    let addQuery = 
        `INSERT INTO students(rollNo, firstName, lastName, email, password, semester, departmentId, address, bloodGroup, profileImagePath) VALUES(${rollNo}, "${firstName}", "${lastName}", "${email}", "${hashedPassword}", ${semester}, ${departmentId}, "${address}", "${bloodGroup}", null);`;

    let response = {};

    try {
        const [result, metadata] = await db.sequelize.query(addQuery);
        console.log(result, metadata);
        res.status(200);
        response.status = 'ok';
        response.input = input;
        response.message = `Student added successfully`;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.error = error.errors;
    }
    res.send(response);
});