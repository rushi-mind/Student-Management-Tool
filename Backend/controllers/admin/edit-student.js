const db = require('../../models');

module.exports = (async (req, res) => {
    let input = req.body;
    let rollNo = input.rollNo, updateFields = input.updateFields;
    let query = `UPDATE students SET`;

    if(updateFields.firstName) query += ` firstName = "${updateFields.firstName}",`;
    if(updateFields.lastName) query += ` lastName = "${updateFields.lastName}",`;
    if(updateFields.email) query += ` email = "${updateFields.email}",`;
    if(updateFields.password) query += ` password = "${updateFields.password}",`;
    if(updateFields.semester) query += ` semester = ${updateFields.semester},`;
    if(updateFields.departmentId) query += ` departmentId = ${updateFields.departmentId},`;

    query = query.substring(0, query.length-1)
    query += ` WHERE rollNo = ${rollNo};`;

    let response = {};
    try {
        let [result, metadata] = await db.sequelize.query(query);
        response.status = 'ok';
        response.message = 'Student updated successfully.';
    } catch (error) {
        res.status(400);
        response.status = 'fail';
        response.message = error.parent.sqlMessage;
    }
    res.send(response);
});