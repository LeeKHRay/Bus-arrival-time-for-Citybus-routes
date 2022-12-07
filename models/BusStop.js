const mongoose = require('mongoose');

const BusStopSchema = mongoose.Schema({
    busStopId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    eta: [{ 
        routeId: { type: String, required: true },
        dir: { type: String, required: true },
        time: [{ type: String, required: true }]
    }]
});

module.exports = mongoose.model('BusStop', BusStopSchema);
