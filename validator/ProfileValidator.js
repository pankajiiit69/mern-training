const expValidator = require('express-validator');


const createProfileValidator = [
    expValidator.body('fullname', 'Please provide Fullname').notEmpty(),
    expValidator.body('city', 'Please provide City').notEmpty()
]

module.exports = {createProfileValidator}