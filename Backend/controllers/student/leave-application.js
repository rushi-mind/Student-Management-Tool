const db = require('../../models');
const Joi = require('joi');

const getDateDifferenceInDays = async (dateFrom, dateTo) => {
    let duration = null;
    try {
        duration = (await db.sequelize.query(`select DATEDIFF("${dateTo}", "${dateFrom}") as duration;`))[0][0].duration;
    } catch (error) {
        console.log(error);
    }
    return duration+1;
}

module.exports = (async (req, res) => {
    let input = req.body;
    let studentId = input.studentId, dateFrom = input.date.from, dateTo = input.date.to, reason = input.reason, isApproved = null;

    if(studentId !== req.student.id) return res.status(400).send('Invalid auth token.');

    const schema = Joi.object({
        studentId: Joi.number().integer().required(),
        date: Joi.object({
            from: Joi.date().greater('now').required(),
            to: Joi.date().greater(Joi.ref('from')).required()
        }).required(),
        reason: Joi.string()
    });
    let isValidInput = true;
    try {
        isValidInput = await schema.validateAsync(input);
    } catch (error) {
        isValidInput = false;
    }
    if(!isValidInput) return res.status(400).send('Invalid JOSN input');

    let response = {};

    const duration = await getDateDifferenceInDays(dateFrom, dateTo);
    if(!duration) return res.status(400).send('Invalid JSON input');

    let query = `INSERT INTO leaveApplications(studentId, dateFrom, dateTo, duration, reason, isApproved) VALUES(${studentId},"${dateFrom}", "${dateTo}", ${duration}, "${reason}", null);`;

    try {
        let [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.message = `Applied for leave from ${dateFrom} to ${dateTo}`;
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }

    res.send(response);
});