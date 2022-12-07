const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    favBusStopIds: [{ type: String }],
    homeLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    }
});

module.exports = mongoose.model('User', UserSchema);
