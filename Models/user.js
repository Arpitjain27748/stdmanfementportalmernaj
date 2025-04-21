const { name } = require("ejs");
const mongoose = require("mongoose");

const user = mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    mobile:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        default:"student"
    },
    blockstatus:{
        type:String,
        required:true,
        default:"unblocked"
    },
    gender:{
        type:String,
        required:true
    },
    photo:{
        type:Buffer,
        contentType:String,
        required:false
    },
    photoformat:{
        type:String,
        require:false
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    checkbok:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:Number
    },
    emailverified:{
        type:String,
        required:false,
        default:'unverified'
    },
    checkbox:{
        type:String,
        required:true
    }
    
})
let usermodel = mongoose.model('profile',user)
module.exports = usermodel