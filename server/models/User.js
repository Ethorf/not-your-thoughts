const mongoose = require('mongoose');
//using the mongoose package var to generate a DB schema


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  consecutiveDays: {
    type: Number,
    default: 0
  },
  totalDays: {
    type: Number,
    default: 0
  },
  entries: {
    type: Array
  },
  lastDayCompleted:{
    type:String,
    default:null
  }
});


module.exports = User = mongoose.model('users', UserSchema);