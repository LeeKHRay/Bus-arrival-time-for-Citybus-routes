const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    username: { type: String, required: true },
	content: { type: String, required: true },
	busStopId: { type: String, required: true },
    datetime: { type: String, required: true }
});

module.exports = mongoose.model('Comment', CommentSchema);
