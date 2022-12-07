const mongoose = require('mongoose');

const RouteSchema = mongoose.Schema({
	routeId: { type: String, required: true },
    dir: { type: String, required: true },
    busStops: [{ 
        busStop: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
        seq: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Route', RouteSchema);
