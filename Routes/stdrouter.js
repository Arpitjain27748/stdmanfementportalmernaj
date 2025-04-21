const express = require("express");
const myController = require("../Controller/myController");
const stdrouter= express.Router();

const multer = require('multer');
const mystorage = multer.memoryStorage();
const upload = multer({storage:mystorage})

stdrouter.get('/' ,myController.checkuserlogin, myController.studenthome);
// adminrouter.get('/register' , myController.checkuserlogin, myController.adminregisterget);
// adminrouter.post('/register' , myController.checkuserlogin,upload.single('stdphoto'), myController.adminregisterpost);
// adminrouter.post('/adminupdate', myController.checkuserlogin,upload.single('stdphoto'),myController.adminupdate)
// adminrouter.post('/verifyuser', myController.checkuserlogin, myController.userverfication);
// adminrouter.get('/viewprofile', myController.checkuserlogin,myController.adminprofille);

module.exports=     stdrouter;