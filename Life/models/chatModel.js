const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    sender_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type:String,
        require: true
    },
},
{ timestamps:true }
);

module.exports = mongoose.model('Chat', userSchema);