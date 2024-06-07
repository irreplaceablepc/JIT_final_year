const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const AVATAR_PATH = path.join('/uploads/users/avatars');
const PAVATAR_PATH = path.join('/uploads/users/pimgs');
const userSchema = new mongoose.Schema({
    is_online:{
        type:String,
        default:'0'
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true,
        unique:true
    },
    bio:{
        type:String,
    },
    avatar: {
        type: String,
    },
    totalPost: {
        type: Number,
        default: 0
    },
    totalFollowing: {
        type: Number,
        default: 0
    },
    totalFollowers:{
        type: Number,
        default: 0
    }
},{
    timestamps:true
});
let storage = multer.diskStorage({
    //variable file is the file that we receive from req and cb is callback function 
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },
    filename: function (req, file, cb) {
        // field name is avatar here 
      cb(null, file.fieldname + '-' + Date.now());
      console.log(file.mimetype);
    }
  });

  let pstorage = multer.diskStorage({
    //variable file is the file that we receive from req and cb is callback function 
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', PAVATAR_PATH));
    },
    filename: function (req, file, cb) {
        // field name is avatar here 
      cb(null, file.fieldname + '-' + Date.now());
      console.log(file.mimetype);
    }
  });


  //static functions like in programming
  userSchema.statics.uploadedAvatar = multer({storage: storage}).single('avatar'); //use single to upload single file
  userSchema.statics.avatarPath = AVATAR_PATH;
  userSchema.statics.puploadedAvatar = multer({storage: pstorage}).single('pimgs'); //use single to upload single file
  userSchema.statics.pavatarPath = PAVATAR_PATH;
module.exports = mongoose.model('User',userSchema);