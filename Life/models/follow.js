const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    current_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Follow', followSchema);
