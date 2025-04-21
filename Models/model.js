const mongodb = require("./mongodb");
const contactus = require("./contact");
const user = require("./user");
const nodemailer = require('nodemailer');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');
// const { callbackPromise } = require("nodemailer/lib/shared");
const { mongo } = require("mongoose");

let newotp = getnewotp();
// console.log(newotp)
async function getuserinfo(userid) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let info = await mycol.findOne({ $or: [{ mobile: parseInt(userid) }, { email: userid }] })
        return info
    } catch (error) {
        console.log("error in get info", error)
    } finally {
        await mongodb.getdisconnect

    }
}

async function checkuserinfo(usermobile, useremail) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let serachinfo = await mycol.findOne({ $or: [{ mobile: parseInt(usermobile) }, { email: useremail }] })
        return serachinfo
    } catch (error) {
        console.log("error in search info")
    } finally {
        await mongodb.getdisconnect();
    }
}
async function checkuserinfoforupdate(usermobile, useremail) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let serachinfo = await mycol.findOne({ email: { $ne: useremail }, mobile: parseInt(usermobile) })
        return serachinfo
    } catch (error) {
        console.log("error in search info for update")
    } finally {
        await mongodb.getdisconnect();
    }
}
async function login(logininfo, callback) {
    let datauser = await getuserinfo(logininfo.adminid)
    if (datauser === null) {
        return callback('notfound', null)
    }
    else if (await !passwordcompare(logininfo.adminpassword, datauser.password)) {
        return callback('invalidpassword', null)
    }
    else if (datauser.blockstatus != 'unblocked') {
        return callback('blocked', null)
    }
    else if (datauser.emailverified === 'unverified') {
        return callback('notverified', null)
    }
    else if (datauser.role == 'admin') {
        return callback('admin', datauser)
    }
    else {
        return callback('student', datauser)
    }
}


async function savecontact(userinfo, callback) {
    let user = new contactus({
        name: userinfo.uname,
        phone: userinfo.phone,
        email: userinfo.email,
        city: userinfo.city
    });
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection("usercontacts");
        let insert = await mycol.insertOne(user);
        return callback(insert.acknowledged)
    } catch (error) {
        console.error("error in contact us", error)
        return callback(error

        )
    }
    finally {
        await mongodb.getdisconnect();
    }

}

async function saveuser(userinfo, userphot, callback) {
    let userinfos = await checkuserinfo(userinfo.urmobile, userinfo.uremail);
    if (userinfos != null) {
        return callback('already')
    } else {
        sendemail(userinfo.uremail, newotp);
        let haspass = await bcrypt.hash(userinfo.urpwd, 10)
        let finaluser = new user({
            name: userinfo.urname,
            mobile: userinfo.urmobile,
            email: userinfo.uremail,
            emailvarified: null,
            role: userinfo.role,
            otp: newotp,
            password: haspass,
            blockstatus: userinfo.blockstatus,
            gender: userinfo.gender,
            dob: userinfo.urdob,
            photo: userphot.p,
            photoformat: userphot.f,
            address: userinfo.uraddress,
            city: userinfo.urcity,
            state: userinfo.urstate,
            checkbox: userinfo.uragree
        })
        try {
            let db = await mongodb.getconnect();
            let mycol = db.collection('profile');
            let insert = await mycol.insertOne(finaluser);
            return callback(insert.acknowledged)
        } catch (error) {
            console.log("error in saving user data", error)
        } finally {
            await mongodb.getdisconnect()
        }
    }

}

async function verify(verifyinfo, callback) {
    let datauser = await getuserinfo(verifyinfo.email)
    if (datauser === null) {
        return callback('notfound', null)
    }
    else if (datauser.otp != verifyinfo.otp) {
        return callback('invalid', datauser)
    }
    else {
        try {
            let db = await mongodb.getconnect()
            let mycol = db.collection('profile');
            let verify = await mycol.updateOne({ email: verifyinfo.email }, { $set: { emailverified: 'verified' } })
            return callback(verify.acknowledged, datauser)
        } catch (error) {
            console.log("error in verification", err)
        } finally {
            await mongodb.getdisconnect();
        }
    }
}

async function getprofileinfo(id, callback) {
    let userdata = await getuserinfo(id)
    return callback(userdata)
}

async function updateprofile(updateinfo, updatephoto, callback) {
    let objectid = { _id: new ObjectId(updateinfo.urid) };
    let email = updateinfo.uremail;
    let urinfo = await checkuserinfoforupdate(updateinfo.urmobile, email);
    // console.log(objectid)
    if (urinfo != null) {
        let updateinfo = await getuserinfo(email)
        return callback('already', updateinfo)
    }
    else {
        let haspass = await bcrypt.hash(updateinfo.urpwd, 10)
        let finaluser = new user({
            _id: objectid,
            name: updateinfo.urname,
            mobile: updateinfo.urmobile,
            emailverified: 'verified',
            password: haspass,
            blockstatus: updateinfo.blockstatus,
            gender: updateinfo.urgender,
            dob: updateinfo.urdob,
            photoformat: updateinfo.f,
            address: updateinfo.uraddress,
            city: updateinfo.urcity,
            state: updateinfo.urstate,
            checkbox: updateinfo.uragree,
            role: updateinfo.role
        });
        try {
            let db = await mongodb.getconnect();
            let mycol = db.collection('profile');
            let updateprofile = await mycol.updateOne(objectid, { $set: finaluser })
            let updateimg = await mycol.updateOne(objectid, { $set: { photo: updatephoto.p } })
            let updatedinfo = await getuserinfo(email);
            return callback(updateprofile.acknowledged, updatedinfo)
        } catch (error) {
            console.log('error in updating data', error)
        } finally {
            await mongodb.getdisconnect()
        }
    }
}
async function passwordcompare(loginpass, datapass) {
    let result = await bcrypt.compare(loginpass, datapass);
    return result;
}

async function getallcontactlist(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('usercontacts');
        let contactlist = await mycol.find().toArray();
        if (contactlist == null) {
            return callback('notfound')
        } else {
            return callback(contactlist)
        }
    } catch (error) {
        console.log('error in getting contact list', error)
    } finally {
        await mongodb.getdisconnect()
    }
}

async function deletecontact(id, callback) {
    let objectid = { _id: new ObjectId(id) };
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('usercontacts');
        let contactdelete = await mycol.deleteOne(objectid)
        let contactlist = await mycol.find().toArray();
       return callback ( contactdelete.acknowledged,contactlist)
    } catch (error) {
        console.log('error in delete from contact list', error)
    } finally {
        await mongodb.getdisconnect()
    }
}
async function deleteuser(id, callback) {
    let objectid = { _id: new ObjectId(id) };
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let userdelete = await mycol.deleteOne(objectid)
        let usertlist = await mycol.find().toArray();
       return callback ( userdelete.acknowledged,usertlist)
    } catch (error) {
        console.log('error in delete from contact list', error)
    } finally {
        await mongodb.getdisconnect()
    }
}
async function getresteredstdlist(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let stdlsit = await mycol.find().toArray();
        if (stdlsit == null) {
            return callback('notfound')
        } else {
            return callback(stdlsit)
        }
    } catch (error) {
        console.log('error in getting registered std list:'+error)
    }   finally{
        await mongodb.getdisconnect()
    }
}
async function blockprofile(useremail , callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let userblock = await mycol.updateOne({email:useremail},{$set:{blockstatus:'blocked'}})   
        callback (userblock.acknowledged)     
    } catch (error) {
        console.log("error in blocking status:",error)
    } finally{
        await mongodb.getdisconnect()
    }
}
module.exports = { savecontact, login, saveuser, verify, getprofileinfo, updateprofile,getallcontactlist,deletecontact,getresteredstdlist,blockprofile,deleteuser}



function getnewotp() {
    let otp = ''
    let chars = '123456789'
    for (i = 0; i < 6; i++) {
        let index = Math.floor(Math.random() * 9);
        otp += chars.charAt(index)
    }
    return otp
}

async function sendemail(useremail, newotp) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "arpitjain27748@gmail.com",
            pass: "kpxw hrkv dgmx ofzc"
        }
    })

    let email01 = {
        from: "arpitjain27748@gmail.com",
        to: useremail,
        subject: "otp for User Verification by ... college",
        html: `your otp is ${newotp} pls don't share with others we didn't call anyone for otp you have to come at office for user verification, so pls be carefull  regards ARPIT JAIN <h1>SAMARPIT &copy;2025</h1>`
    }
    transporter.sendMail(email01, (err, result) => {
        if (err) {
            console.log("error in sending email:", err)
        }
        else {
            console.log("email sent success", result.response)
        }
    })
}
