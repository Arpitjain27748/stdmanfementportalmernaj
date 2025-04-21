const mongoose= require("mongoose");

let userschema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  phone:{
    type:Number,
    required:true
  },
  email:{
    type:String,
    required:false
  },
  city:{
    type:String,
    required:true
  }
})
let usermodel = mongoose.model('usercontacts',userschema)
module.exports= usermodel