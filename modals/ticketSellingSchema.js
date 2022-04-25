const mongoose = require("mongoose");




var ticketInfo = new mongoose.Schema({
    tickeFor:String,
    routeName:String,
    vehicleName:String,
    vehicleNumber:String,
    vehicleQuantity:Number,
    dateForVehicle:Date,
    passangerName:String,
    passangerNumber:String,
    passangerQuantity:Number,
    passangerDate:Date,
    timeSchedule:String,
    ferryName:String,
    price:Number,
    ticketId:String
})



module.exports = mongoose.model("ticketInfo",ticketInfo);