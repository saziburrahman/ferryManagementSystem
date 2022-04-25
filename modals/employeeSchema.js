const mongoose = require('mongoose');
const schema = mongoose.Schema;

var employee = new schema({
    nameInput:String,
    address:String,
    email:String,
    password:String,
    confirmPass:String,
    joinDate:Date,
    contactNumber:String,
    gender:String,
    emplyeeid:String
})


module.exports = mongoose.model('employeeTable',employee)