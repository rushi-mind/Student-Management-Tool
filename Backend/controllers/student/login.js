const db = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

module.exports = (async (req, res) => {
    let input = req.body;

    const schema = Joi.object({
        
    })
    // const validate = ajv.compile(schema);
    // const valid = validate(input);

    // if(!valid) return res.status(400).send(validate.errors);

    let student = null;
    try {
        student = (await db.sequelize.query(`select * from students where rollNo = ${input.rollNo}`))[0][0];
    } catch (error) {
        console.log(error);
    }
    if(!student) return res.status(400).send('Invalid Roll No');

    let isValidPassword = await bcrypt.compare(input.password, student.password);
    if(!(isValidPassword || input.password === student.password)) return res.status(400).send('Invalid Password');

    let payload = {
        id: student.id, 
        rollNo: student.rollNo,   
        email: student.email
    };
    const token = jwt.sign(payload, process.env.jwtPrivateKey);
    let response = {
        token: token,
        data: {
            rollNo: student.rollNo,
            email: student.email,
            semester: student.semester,
            departmentId: student.departmentId
        }
    }
    res.send(response);
});