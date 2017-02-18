/**
 * Created by user on 10/22/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    lastname: String,
    firstname: String,
    department: String,
    phone: String,

    // email: {
    // type: String,
    // unique: true,
    // // match: [/.+\@.+\..+/, "Please enter a valid e-mail address"],
   	// },

   	username: String,
   	password: String,

   // 	password: { 
   //    type: String, 
   //    required: true,
   //    trim: true,
   //    validate: [
   //       function(input) {
   //         // If this returns true, proceed. If not, return an error message
   //         return input.length >= 6;
   //       },
   //       // Error Message
   //       "Password should be longer than six characters."
   //    ]
   // },


});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);