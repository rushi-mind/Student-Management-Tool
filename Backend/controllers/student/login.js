const db = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (async (req, res) => {
    let input = req.body;
    let rollNo = input.rollNo, password = input.password;
    if(!rollNo || !password) return res.status(400).send('Invalid JSON input');

    let student = (await db.sequelize.query(`select * from students where rollNo = ${rollNo}`))[0][0];
    if(!student) return res.status(400).send('This rollNo does not exist.');

    let isValid = await bcrypt.compare(password, student.password);
    if(!isValid) return res.status(400).send('Invalid Password');

    let payload = {
        id: student.id, 
        rollNo: student.rollNo, 
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email, 
        semester: student.semester,
        departmentId: student.departmentId
    };
    const token = jwt.sign(payload, process.env.jwtPrivateKey);
    res.header('x-auth-token', token).send(payload);
});