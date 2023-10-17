const mongoose = require('mongoose');

const mySchemaJson = {
    username: {type: String, required:true},
    email: {type: String, required:true},
    phone: {type: String},
    password:{type: String}
}
const mySchema = new mongoose.Schema(mySchemaJson);
const UserModel = mongoose.model('User', mySchema, 'user');

module.exports = UserModel;
