const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let query = `DELETE FROM students WHERE rollNo = ${input.rollNo};`;

    let response = {};
    try {
        let student = (await db.sequelize.query(`select * from students where rollNo = ${input.rollNo}`))[0];
        if(student.length) {
            let [result, metadata] = await db.sequelize.query(query);
            console.log(result, metadata);
            res.status(200);
            response.status = 'ok';
            response.message = 'Student deleted successfully.';
            response.student = student;
        }
        else {
            res.status(400);
            response.status = 'fail';
            response.message = `${input.rollNo}: Student does not exist.`;
        }
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});